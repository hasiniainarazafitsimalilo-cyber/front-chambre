import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getNightCount, toAvailabilityQuery } from "../lib/utils/booking";

describe("booking helpers", () => {
  it("computes the correct night count for a stay", () => {
    const checkIn = new Date("2026-10-17T00:00:00Z");
    const checkOut = new Date("2026-10-20T00:00:00Z");

    assert.equal(getNightCount(checkIn, checkOut), 3);
  });

  it("builds the query params expected by the backend", () => {
    assert.deepEqual(
      toAvailabilityQuery({
        check_in_date: "2026-10-17",
        check_out_date: "2026-10-20",
        adults: 2,
        children: 1,
        room_type_id: "7e90cf87-b7b7-4d6d-9a28-900ebce0a5df",
      }),
      {
        check_in_date: "2026-10-17",
        check_out_date: "2026-10-20",
        adults: 2,
        children: 1,
        room_type_id: "7e90cf87-b7b7-4d6d-9a28-900ebce0a5df",
      },
    );
  });
});
