const inputFokontanyName = document.getElementById("saisi-input")
const containerForPrint = document.querySelector("#print .container")
const tableTag = document.createElement('table')
const tbodyTag = document.createElement('tbody')
const theadTag = document.createElement('thead')
const footerContainer = document.querySelector('footer .container')

tableTag.classList.add('table-standard')
inputFokontanyName.tabIndex = 1


let data
let search
let resultToPrint
const NUMBER_OF_DATA = 4
const TABLE_HEADINGS = ["Région", "District", "Commune", "Fokontany"]
const CELLS_TYPES = ["td", "td", "td", "td"]
const RESULT_TO_PRINT_MAX = 400

const getDataFokontany = async () => {
    try {
        const dataFokontanyResponse = await fetch("./js/data/liste_fokontany_par_commune_data.json")
        return dataFokontanyResponse.ok ? dataFokontanyResponse.json() : {}
    } catch (error) {

    }
    return {}
}


const initData = async () => {
    data = await getDataFokontany()
    delete data.Region
    return Object.values(data).length ? true : false
}

const searchFokontany = (searchStr, dataToHandle) => {
    search = searchStr.trim()

    const rexExpForSearch = new RegExp(`\{"commune":"[\w '-_]+","region":"[\w '-_]+","fokontany":"[\w '-_]*${search}[\w '-_]*","district":"[\w '-_]+"\}`, "ig")
    const stringifyData = JSON.stringify(dataToHandle)
    const matchesValues = stringifyData.match(rexExpForSearch)
    let result = matchesValues.map(result => JSON.parse(result))

    return search ? result : null
}

const generateElementTDTag = ({ htmlOuter, textContent }) => {
    const tempVar = document.createElement('td')
    if (htmlOuter) {
        tempVar.innerHTML = htmlOuter
    }
    if (textContent) {
        tempVar.textContent = textContent
    }
    return tempVar
}

const generateElementTHTag = ({ textContent, scopeProperty }) => {
    const tempVar = document.createElement('th')
    tempVar.textContent = textContent
    tempVar.scope = scopeProperty
    return tempVar
}

const generateRowsOfTableOfResult = (results) => {
    let tempVarArray = ''
    for (const result of results) {
        [commune, region, fokontany, district] = Object.values(result)
        let fokontanyTemp = fokontany.substring(fokontany.toUpperCase().indexOf(search.toUpperCase()), fokontany.toUpperCase().indexOf(search.toUpperCase()) + search.length)
        tempResult = [region, district, commune, fokontany.replace(new RegExp(`${search}`, "i"), `<span style="background-color: yellow;">${fokontanyTemp}</span>`)]
        tempVarArray += `<tr><td>${tempResult.join('</td><td>')}</td></tr>`
    }
    return tempVarArray
}

const generateTableHeading = (TABLE_HEADINGS) => {

    return `<tr><th scope="col">${TABLE_HEADINGS.join('</th><th scope="col">')}</th></tr>`
}

const handleOnChangeSearchInput = (event) => {

    tbodyTag.innerHTML = ""
    theadTag.innerHTML = ""
    tableTag.innerHTML = ""
    containerForPrint.innerHTML = "<h2>Data Loading...</h2>"
    footerContainer.innerHTML = ""
    try {
        resultToPrint = searchFokontany(event.target.value, data)
        const resultLength = resultToPrint.length
        if (resultLength > RESULT_TO_PRINT_MAX) {
            let pages = Math.floor(resultLength / RESULT_TO_PRINT_MAX) + (resultLength - Math.floor(resultLength / RESULT_TO_PRINT_MAX) * RESULT_TO_PRINT_MAX)
            let sectionButtonsPagination = '<div class="content-perfect-center">'

            for (let p = 1; p <= pages; p++) {
                sectionButtonsPagination += '<button class="btn btn-primary" onclick="printPage(' + p + ')">p-' + String(p).padStart(2, "0") + '</button>'
            }
            sectionButtonsPagination += "</div>"
            footerContainer.innerHTML = sectionButtonsPagination
        }

        if (resultLength) {
            printPage(1)
        }

    } catch (error) {
        containerForPrint.innerHTML = "<h2>Tsy misy anarana fokontany toy io ato.</h2>"
        footerContainer.innerHTML = ""
        console.log(error)
    }
}

const clearInputForSearch = (input) => {
    input.value = ''
}

const printPage = (page = 1) => {
    
    tbodyTag.innerHTML = ""
    theadTag.innerHTML = ""
    tableTag.innerHTML = ""
    containerForPrint.innerHTML = "<h2>Data Loading...</h2>"

    
    theadTag.innerHTML = generateTableHeading(TABLE_HEADINGS)
    tableTag.innerHTML += theadTag.outerHTML
    tbodyTag.innerHTML = generateRowsOfTableOfResult(resultToPrint.slice(page, page + RESULT_TO_PRINT_MAX))
    tableTag.innerHTML += tbodyTag.outerHTML
    containerForPrint.innerHTML = tableTag.outerHTML
}

document.addEventListener("DOMContentLoaded", () => {
    initData();
    inputFokontanyName.addEventListener("keyup", handleOnChangeSearchInput)
    inputFokontanyName.addEventListener("focus", handleOnChangeSearchInput)
})