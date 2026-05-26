import { create } from 'zustand'

type CountryState = {
  selectedCountry: string
  setSelectedCountry: (country: string) => void
}

export const useCountryStore = create<CountryState>((set) => ({
  selectedCountry:
    localStorage.getItem('selectedCountry') || 'UAE',

  setSelectedCountry: (country) => {
    localStorage.setItem('selectedCountry', country)

    set({
      selectedCountry: country
    })
  }
}))