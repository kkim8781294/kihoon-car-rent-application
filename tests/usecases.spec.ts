import {CheckCarAvailability } from "../src/core/usecases/CheckCarAvailability";
import {BookCar } from "../src/core/usecases/BookCar";
import { ListBooking } from "../src/core/usecases/ListBooking";
import {ApproveBookingByAdmin } from "../src/core/usecases/ApproveBookingByAdmin";
import {  DeclineBookingByAdmin } from "../src/core/usecases/DeclineBookingByAdmin";


import type { BookingStatus, Car,  Booking } from "../src/core/domain/entities";
import type { CarRepo, BookingRepo } from "../src/core/methodRepository";

// make test object
function TempCarRepo(seed: Partial<Car>[]): CarRepo {
  const cars: Car[] = seed.map((c, i) => ({
    id: (c.id ?? String(i + 1)),
    model: c.model ?? "Car",
    year: c.year ?? 2024,
    dailyRate: c.dailyRate ?? 100,
    active: c.active ?? true,
  }));
  return {
    async findById(id) { return cars.find(c => c.id === id) || null; },
    async listActive() { return cars.filter(c => c.active); },
    async create(c) {
      const nc: Car = {
        id: String(cars.length + 1),
        model: c.model,
        year: c.year,
        dailyRate: c.dailyRate,
        active: c.active ?? true
      };
      cars.push(nc);
      return nc;
    }
  };
}

function TempBookingRepo(seed: Partial<Booking>[]): BookingRepo {
  const arr: Booking[] = seed.map((b, i) => ({
    id: b.id ?? String(i + 1),
    carId: b.carId ?? "1",
    userId: b.userId,
    guestEmail: b.guestEmail,
    startDate: b.startDate ?? "2025-10-10",
    endDate: b.endDate ?? "2025-10-12",
    total: b.total ?? 200,
    status: (b.status as BookingStatus) ?? "pending",
  }));
  return {
    async create(b) { const id = String(arr.length + 1); const n = { ...b, id, status: (b.status ?? "pending") as BookingStatus } as Booking; arr.push(n); return n; },
    async listAll() { return arr.slice().reverse(); },
    async listByUser(userId) { return arr.filter(b => b.userId === userId); },
    async findActiveByCarInRange(carId, s, e) {
      const S = new Date(s), E = new Date(e);
      return arr.filter(b =>
        b.carId === carId &&
        (b.status === "pending" || b.status === "approved") &&
        !(E < new Date(b.startDate) || S > new Date(b.endDate))
      );
    },
    async updateStatus(id, status) {
      const i = arr.findIndex(b => b.id === id);
      if (i < 0) return null;
      arr[i].status = status as BookingStatus;
      return arr[i];
    },
    async editDates(id, patch) {
      const i = arr.findIndex(b => b.id === id);
      if (i < 0) return null;
      arr[i] = { ...arr[i], ...patch };
      return arr[i];
    }
  };
}

// Jest Test
describe("UseCase Test: CheckCarAvailability", () => {
  
  
  // CheckCarAvailability
  test("Car Availability True", async () => {
    const carRepo = TempCarRepo([{ id: "1", model: "A", year: 2024, dailyRate: 100, active: true }]);
    const bookingRepo = TempBookingRepo([]);
    const run = CheckCarAvailability({ carRepo, bookingRepo });
    const out = await run({ carId: "1", startDate: "2025-10-20", endDate: "2025-10-22" });
    expect((out as any).available).toBe(true);
  });

  test("Throw Error when car is inactive", async () => {
    const carRepo = TempCarRepo([{ id: "X", model: "B", year: 2024, dailyRate: 100, active: false }]);
    const bookingRepo = TempBookingRepo([]);
    const run = CheckCarAvailability({ carRepo, bookingRepo });
    const out = await run({ carId: "X", startDate: "2025-10-20", endDate: "2025-10-22" });
    expect(out).toHaveProperty("error", "No car and active");
  });
 
  test("Date overlap, return false", async () => {
    const carRepo = TempCarRepo([{ id: "1", model: "A", year: 2024, dailyRate: 100, active: true }]);
    const bookingRepo = TempBookingRepo([{ carId: "1", startDate: "2025-10-20", endDate: "2025-10-22", status: "approved" }]);
    const run = CheckCarAvailability({ carRepo, bookingRepo });
    const out = await run({ carId: "1", startDate: "2025-10-22", endDate: "2025-10-23" });
    expect((out as any).available).toBe(false);
  });


  // BookingCar
  test("Test booking car and calculate total price ", async () => {
    const carRepo = TempCarRepo([{ id: "1", model: "A", year: 2024, dailyRate: 100, active: true }]);
    const bookingRepo = TempBookingRepo([{ carId: "1", startDate: "2025-10-20", endDate: "2025-10-22", status: "approved" }]);
    const run = BookCar({ carRepo, bookingRepo });
    await expect(run({ carId: "1", startDate: "2025-10-21", endDate: "2025-10-23", guestEmail: "g@x.com" }))
      .rejects.toThrow("Arleady booked");
    const ok = await run({ carId: "1", startDate: "2025-10-23", endDate: "2025-10-25", guestEmail: "g@x.com" });
    expect(ok.total).toBe(200);
  });

  test("CreateBooking: invalid date range", async () => {
    const carRepo = TempCarRepo([{ id: "1", model: "A", year: 2024, dailyRate: 100, active: true }]);
    const bookingRepo = TempBookingRepo([]);
    const run = BookCar({ carRepo, bookingRepo });
    await expect(run({ carId: "1", startDate: "bad", endDate: "bad2", guestEmail: "g@x.com" }))
      .rejects.toThrow("Error date");
  });

  test("CreateBooking Price can't be 0", async () => {
    const carRepo = TempCarRepo([{ id: "1", model: "Zero", year: 2024, dailyRate: 0, active: true }]);
    const bookingRepo = TempBookingRepo([]);
    const run = BookCar({ carRepo, bookingRepo });
    await expect(run({ carId: "1", startDate: "2025-11-10", endDate: "2025-11-11", guestEmail: "g@x.com" }))
      .rejects.toThrow("Date format check");
  });

  // List  Booking
  test("Show specific user list", async () => {
    const bookingRepo = TempBookingRepo([
      { userId: "U1", carId: "1", startDate: "2025-10-10", endDate: "2025-10-12" },
      { userId: "U2", carId: "1", startDate: "2025-10-11", endDate: "2025-10-13" },
    ]);
    const run = ListBooking({ bookingRepo });
    const list = await run({ userId: "U1" });
    expect(list.every(b => b.userId === "U1")).toBe(true);
  });

    // ApproveBooking
    test("Guard approve booking", async () => {
      const bookingRepo = TempBookingRepo([]);
      const run = ApproveBookingByAdmin({ bookingRepo });
      await expect(run({ id: "nope" })).rejects.toThrow("No booking");
    });

  test("Update status after approved", async () => {
    const bookingRepo = TempBookingRepo([{ id: "B1", carId: "1", startDate: "2025-10-20", endDate: "2025-10-21", status: "pending" }]);
    const approve = ApproveBookingByAdmin({ bookingRepo });
    const out = await approve({ id: "B1" });
    expect(out.status).toBe("approved");
  });


  test("Success path updates status to declined", async () => {
    const bookingRepo = TempBookingRepo([{ id: "B2", carId: "1", startDate: "2025-10-20", endDate: "2025-10-21", status: "pending" }]);
    const decline = DeclineBookingByAdmin({ bookingRepo });
    const out = await decline({ id: "B2" });
    expect(out.status).toBe("declined");
  });

    test("Decline guard", async () => {
      const bookingRepo = TempBookingRepo([]);
      const run = DeclineBookingByAdmin({ bookingRepo });
      await expect(run({ id: "nope" })).rejects.toThrow("No booking");
    });
  });