'strict mode'
const infoBtn = document.querySelector('#header__info-btn')
// TODO: Use IDs insteaf of classes for single elements. - DONE
const searchBtn = document.querySelector('#country__btn')
const countryInput = document.querySelector('#country-input')
const latitudeInput = document.querySelector('#latitude-input')
const longitudeInput = document.querySelector('#longitude-input')
const firstWayError = document.querySelector('#first-error')
const lowerError = document.querySelector('#second-error')
const beforeResult = document.querySelector('#country-result')
const afterResult = document.querySelector('#after-result')
const countryForm = document.querySelector('#country-form')
const liBefore = document.querySelector('#country__list-before')
const liAfter = document.querySelector('#country__list-after')
const flagImg = document.querySelectorAll('.country__img')
const countryTitles = document.querySelectorAll('.country__box-result-title')
const countryTexts = document.querySelectorAll('.country__box-result-text')
const liResults = document.querySelectorAll('.li-result')
// TODO: Move to consts.js - done

import { URL_BORDERS, URL_COUNTRY, URL_CORDS, DEFAULT_ERROR } from './consts.js'
const searchByName = () => {
	const countryName = countryInput.value

	if (countryName.length < 4) {
		firstWayError.textContent = `Name is too short. Try to use full name of a country.`

		return
	}

	const re = /^[a-zA-Z\s]*$/

	if (!re.test(countryName)) {
		firstWayError.textContent = `Input should consist only of letters available in English.`

		return
	}

	return getCountry(URL_COUNTRY, countryName)
}

// TODO: IF Refactor - DONE
const checkCords = (lat, lng) => {
	const latNum = parseFloat(lat)
	const lngNum = parseFloat(lng)
	if (latNum < -90 || latNum > 90) return (lowerError.innerHTML = 'lattitude range is -90 to 90.')
	if (lngNum < -180 || lngNum > 180) return (lowerError.innerHTML = 'longitude range is -180 to 180.')
	return getCountryFromCords(latNum, lngNum)

	// TODO: Separate error messages for lattitiude range & longitude range (UX). - DONE
}
window.getCountryFromBorders = async border => {
	try {
		const res = await fetch(URL_BORDERS + border)
		if (res.status == 404) throw new Error(`Couldn't find country with entered name. Try again.`)
		if (res.status == 403) throw new Error(`3 requests can be made per second. Try slower.`)
		const data = await res.json()
		return displayCountryInfo(...data)
	} catch (err) {
		firstWayError.innerHTML = err?.message ?? DEFAULT_ERROR
	}
}

// TODO: API URL to consts - DONE
// TODO: Error Refactor - DONE
const getCountryFromCords = async (lat, lng) => {
	try {
		const res = await fetch(URL_CORDS + `countryCode?lat=${lat}&lng=${lng}&username=ravenly&type=JSON`)
		if (res.status == 403) throw new Error(`3 requests can be made per second. Try slower.`)
		const data = await res.json()
		if ('status' in data) throw new Error(`The entered coordinates are outside the borders of any country.`)
		return getCountry(URL_COUNTRY, data.countryName)
	} catch (err) {
		lowerError.innerHTML = err?.message ?? DEFAULT_ERROR
	}
}

// TODO: Error Refactor - DONE
const getCountry = async (URL, countryName) => {
	try {
		const res = await fetch(URL + countryName + '?fullText=true')
		if (res.status == 404) throw new Error(`Couldn't find country with entered name. Try again.`)
		if (res.status == 403) throw new Error(`3 requests can be made per second. Try slower.`)
		const data = await res.json()
		console.log(data)
		return displayCountryInfo(...data)
	} catch (err) {
		firstWayError.innerHTML = err?.message ?? DEFAULT_ERROR
	}
}

const handleCordsChange = e => {
	e.target.value = e.target.value.replace(/\D/g, '')

	if (latitudeInput.value.length || longitudeInput.value.length) {
		countryInput.setAttribute('disabled', true)

		return
	}

	countryInput.removeAttribute('disabled')
}

// TODO: Refactor in the same as handleCordsChange - DONE
const handleCountryChange = e => {
	e.target.value = e.target.value.replace(/\d/g, '')
	if (countryInput.value.length > 0) {
		latitudeInput.setAttribute('disabled', true)
		longitudeInput.setAttribute('disabled', true)
		return
	}
	latitudeInput.removeAttribute('disabled')
	longitudeInput.removeAttribute('disabled')
}

// TODO: IF Refactor - DONE
const searchCountry = () => {
	firstWayError.textContent = ''
	lowerError.textContent = ''
	if (longitudeInput.value != '' && latitudeInput.value != '') {
		return checkCords(latitudeInput.value, longitudeInput.value)
	}
	if (countryInput.value == '') {
		lowerError.textContent = 'fill choosen way inputs.'
		return
	}
	return searchByName()
}

const displayCountryInfo = ({ name, flags, borders, population, continents, languages, currencies, capital, area }) => {
	clearInputs()

	// update info on card before rotate and after rotate
	beforeResult.classList.toggle('before-result-rotate')
	afterResult.classList.toggle('after-result-rotate')

	const infoToList = element => {
		console.log(population, languages, currencies, capital, area)
		// Population
		let peopleNum = population
		if (peopleNum > 100000) {
			peopleNum = `${(population / 1000000).toFixed(2)} mln `
		}
		element.querySelector('.population').innerHTML = population != undefined ? `${peopleNum}` : `n/a`

		// Languages
		element.querySelector('.languages').innerHTML =
			languages != undefined ? `${Object.values(languages).join(', ')}` : `n/a`

		// Currencies
		if (currencies == undefined) {
			element.querySelector('.currencies').innerHTML = `n/a`
		} else {
			for (const key in currencies) {
				element.querySelector('.currencies').innerHTML = `${Object.values(currencies[key]).join(', ')}`
			}
		}

		// Capital
		element.querySelector('.capital').innerHTML = capital != undefined ? `${capital[0]}` : `n/a`

		// Area
		element.querySelector('.area').innerHTML = area != undefined ? `${area}` : `n/a`

		// Borders
		const bordersLi = element.querySelector('.borders')
		bordersLi.innerHTML = ''
		if (Array.isArray(borders) && borders.length >= 1) {
			for (let i = 0; i < borders.length; i++) {
				const el = document.createElement('a')
				el.dataset.country = borders[i]
				el.innerHTML = i === borders.length - 1 ? borders[i] : `${borders[i]}, `

				if (i !== borders.length - 1) {
					el.innerHTML
				}
				//el.dataset.border = border[i];
				bordersLi.appendChild(el)
			}
		} else {
			bordersLi.textContent = 'no neighbours'
		}
	}
	setTimeout(() => {
		flagImg.forEach(flag => {
			flag.setAttribute('src', flags.png)
		})
		countryTitles.forEach(title => {
			title.textContent = name.common
		})
		countryTexts.forEach(text => {
			text.textContent = `Choosen country is ${name.common}. This country is located on the continent ${continents}.`
		})
		infoToList(liBefore)
		infoToList(liAfter)
		liResults.forEach(result => result.classList.add('show'))
	}, 200)
}

const clearInputs = () => {
	countryInput.value = ''
	latitudeInput.value = ''
	longitudeInput.value = ''
	countryInput.removeAttribute('disabled')
	latitudeInput.removeAttribute('disabled')
	longitudeInput.removeAttribute('disabled')
}

// Handle Submit
countryForm.addEventListener('submit', e => {
	e.preventDefault()

	searchCountry()
})

// Handle Country Input Disable
latitudeInput.addEventListener('input', handleCordsChange)
longitudeInput.addEventListener('input', handleCordsChange)
countryInput.addEventListener('input', handleCountryChange)
infoBtn.addEventListener('click', () => {
	getCountry(URL_COUNTRY, 'malaysia')
})

// Handle Borders
document.getElementById('border-countries').addEventListener('click', e => {
	if (!e.target.dataset.country) {
		return
	}

	getCountryFromBorders(e.target.dataset.country)
})
