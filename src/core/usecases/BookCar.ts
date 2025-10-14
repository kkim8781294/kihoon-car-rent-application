import { differenceInCalendarDays, parseISO } from "date-fns";
import { CarRepo, BookingRepo } from "../methodRepository";

export function BookCar(deps: { carRepo: CarRepo; bookingRepo: BookingRepo; }) {
  return async (input: { carId: string; startDate: string; endDate: string; userId?: string; guestEmail?: string; }) => {
    const car = await deps.carRepo.findById(input.carId);
    if (!car || !car.active) throw new Error("차량 없음/비활성");

    // 👉 날짜 문자열을 Date로 변환
    const start = parseISO(input.startDate);
    const end = parseISO(input.endDate);

    // ❗ 유효성 체크 추가 (핵심 수정)
    if (isNaN(+start) || isNaN(+end) || end <= start) {
      throw new Error("날짜 형식/범위 오류");
    }

    // 기존 중복체크
    const overlap = await deps.bookingRepo.findActiveByCarInRange(input.carId, input.startDate, input.endDate);
    if (overlap.length) throw new Error("이미 예약됨");

    const days = Math.max(1, differenceInCalendarDays(end, start));
    const total = car.dailyRate * days;

    // 방어: total이 유효한지 다시 체크 (이 줄은 안전망)
    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("날짜 형식/범위 오류");
    }

    return deps.bookingRepo.create({
      carId: input.carId,
      startDate: input.startDate,
      endDate: input.endDate,
      userId: input.userId,
      guestEmail: input.userId ? undefined : input.guestEmail,
      total,
      status: "pending",
    });
  };
}
