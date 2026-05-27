import { create } from 'zustand'

type CountryState = {
  selectedCountry: string
  hasHydrated: boolean
  setSelectedCountry: (country: string) => void
  hydrateCountry: () => void
}

export const useCountryStore = create<CountryState>((set) => ({
  selectedCountry: 'United Arab Emirates',

  hasHydrated: false,

  setSelectedCountry: (country) => {

    localStorage.setItem('selectedCountry', country)

    set({
      selectedCountry: country
    })
  },

  hydrateCountry: () => {
    const savedCountry = localStorage.getItem('selectedCountry')

    set({
      selectedCountry: savedCountry || 'United Arab Emirates',
      hasHydrated: true
    })
  },


  // selectedCountry:
  //   localStorage.getItem('selectedCountry') || 'United Arab Emirates',

  // setSelectedCountry: (country) => {
  //   localStorage.setItem('selectedCountry', country)

  //   set({
  //     selectedCountry: country
  //   })
  // }

}))

