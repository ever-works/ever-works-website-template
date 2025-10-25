export function formatDate(date: Date, locale: string = 'en-US') {
    return new Date(date).toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })
}

export function formatDateTime(date: Date, locale: string = 'en-US') {
    return new Date(date).toLocaleString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}