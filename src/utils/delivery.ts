export const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  let addedDays = 0

  while (addedDays < days) {
    result.setDate(result.getDate() + 1)

    const day = result.getDay()

    // Skip Saturday (6) and Sunday (0)
    if (day !== 0 && day !== 6) {
      addedDays++
    }
  }

  return result
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}