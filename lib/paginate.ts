export const PER_PAGE = 12;

export function totalPages(size: number) {
    return Math.ceil(size / PER_PAGE);
}

export function paginateMeta(rawPage: number | string = 1, perPage: number = PER_PAGE) {
    const page = typeof rawPage === 'string' ? parseInt(rawPage) : rawPage;
    const start = (page - 1) * perPage;

    return {
        page,
        start,
    }
}
