import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { determineLoanStatus } from "../emprunt.service";

describe("emprunt.service - determineLoanStatus", () => {
  describe("when book is returned (dateRetour is provided)", () => {
    it("should return 'green' if returned on the exact due date", () => {
      const status = determineLoanStatus(
        "2026-05-29T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("green");
    });

    it("should return 'green' if returned before the due date", () => {
      const status = determineLoanStatus(
        "2026-05-28T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("green");
    });

    it("should return 'red' if returned after the due date", () => {
      const status = determineLoanStatus(
        "2026-05-30T12:00:00.000Z",
        "2026-05-29T12:00:00.000Z"
      );
      expect(status).toBe("red");
    });
  });

  describe("when book is not returned yet (dateRetour is null)", () => {
    const fixedNow = new Date("2026-05-20T12:00:00.000Z");

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return 'green' if the due date is more than 7 days in the future", () => {
      // Due date is in 8 days
      const due = new Date(fixedNow.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("green");
    });

    it("should return 'orange' if the due date is exactly 7 days in the future", () => {
      // Due date is in 7 days
      const due = new Date(fixedNow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("orange");
    });

    it("should return 'orange' if the due date is 1 day in the future", () => {
      // Due date is in 1 day
      const due = new Date(fixedNow.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("orange");
    });

    it("should return 'red' if the due date is in the past", () => {
      // Due date was 1 second ago
      const due = new Date(fixedNow.getTime() - 1000).toISOString();
      const status = determineLoanStatus(null, due);
      expect(status).toBe("red");
    });
  });
});
