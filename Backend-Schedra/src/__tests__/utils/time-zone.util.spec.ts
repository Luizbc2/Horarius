import {
  getZonedDateKey,
  getZonedDateParts,
  getZonedDayRange,
  normalizeTimeZone,
} from "../../shared/utils/time-zone.util";

describe("time-zone utilities", () => {
  it("calcula o dia operacional de São Paulo em UTC", () => {
    const range = getZonedDayRange("2026-09-01", "America/Sao_Paulo");
    expect(range?.startsAt.toISOString()).toBe("2026-09-01T03:00:00.000Z");
    expect(range?.endsAt.toISOString()).toBe("2026-09-02T03:00:00.000Z");
  });

  it("respeita dias de 23 horas durante mudança de horário de verão", () => {
    const range = getZonedDayRange("2026-03-08", "America/New_York");
    expect(range?.startsAt.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(range?.endsAt.toISOString()).toBe("2026-03-09T04:00:00.000Z");
  });

  it("extrai data e horário locais sem depender do fuso do processo", () => {
    const instant = new Date("2026-09-01T02:30:00.000Z");
    expect(getZonedDateKey(instant, "America/Sao_Paulo")).toBe("2026-08-31");
    expect(getZonedDateParts(instant, "America/Sao_Paulo")).toMatchObject({ hour: 23, minute: 30 });
  });

  it("usa fallback para um fuso inválido", () => {
    expect(normalizeTimeZone("fuso-inexistente")).toBe("America/Sao_Paulo");
  });
});
