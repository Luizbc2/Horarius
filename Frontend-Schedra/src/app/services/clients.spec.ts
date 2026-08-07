import { createClientsService } from "./clients";

describe("createClientsService", () => {
  test("sends the auth header and query params to the API list endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [],
          page: 2,
          limit: 6,
          totalItems: 0,
          totalPages: 1,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    const response = await createClientsService("token-front").list({
      page: 2,
      search: "Ana",
    });

    expect(response.page).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];
    const headers = requestInit?.headers as Headers;

    expect(String(requestUrl)).toContain("/clients?page=2");
    expect(String(requestUrl)).toContain("search=Ana");
    expect(headers.get("Authorization")).toBe("Bearer token-front");
  });
});
