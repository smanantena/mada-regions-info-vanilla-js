const inputFokontanyName = document.getElementById("saisi-input")
const containerForPrint = document.querySelector("#print .container")
const tableTag = document.createElement('table')
const tbodyTag = document.createElement('tbody')
const theadTag = document.createElement('thead')
const footerContainer = document.querySelector('footer .container')

tableTag.classList.add('table-standard')
inputFokontanyName.tabIndex = 1


let data, dataString
let initDataState = false
let search
let resultToPrint
const NUMBER_OF_DATA = 4
const TABLE_HEADINGS = ["Fokontany", "Commune", "District", "Région"]
const CELLS_TYPES = ["td", "td", "td", "td"]
const RESULT_TO_PRINT_MAX = 400

const getDataFokontany = async () => {

    const dataFokontanyResponse = await fetch("./js/data/liste_fokontany_par_commune_data.json")
    return dataFokontanyResponse.ok ? dataFokontanyResponse.json() : {}

}


const initData = async () => {
    data = await getDataFokontany()
    delete data.Region
    dataString = JSON.stringify(data)
    initDataState = Object.values(data).length ? true : false
    if (!initDataState) {
        containerForPrint.innerHTML = "<h2>Mbola tsy vonona ity tranokala ity.<br>Avereno sokafana rehefa kelikely.</h2>"
    }
}

const searchFokontany = (searchStr, dataToHandle) => {
    search = searchStr.trim()

    const rexExpForSearch = new RegExp(`\{"commune":"[\w '-_\(\)]+","region":"[\w '-_\(\)]+","fokontany":"[\w '-_\(\)]*${search}[\w '-_\(\)]*","district":"[\w '-_\(\)]+"\}`, "ig")
    // const stringifyData = JSON.stringify(dataToHandle)
    const matchesValues = dataToHandle.match(rexExpForSearch)

    let result = matchesValues.map(result => JSON.parse(result))

    return search ? result : undefined
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
        const indexOfSearch = fokontany.toUpperCase().indexOf(search.toUpperCase())
        let fokontanyTemp = fokontany.substring(indexOfSearch, indexOfSearch + search.length)
        tempResult = [fokontany.replace(new RegExp(`${search}`, "i"), `<span style="background-color: yellow;">${fokontanyTemp}</span>`), commune, district, region]
        tempVarArray += `<tr><td class="hit-cell">${tempResult.join('</td><td>')}</td></tr>`
    }
    return tempVarArray
}

const generateTableHeading = (TABLE_HEADINGS) => {

    return `<tr><th class="hit-cell" scope="col">${TABLE_HEADINGS.join('</th><th scope="col">')}</th></tr>`
}

const handleOnChangeSearchInput = (event) => {

    if (initDataState) {
        tbodyTag.innerHTML = ""
        theadTag.innerHTML = ""
        tableTag.innerHTML = ""
        containerForPrint.innerHTML = "<h2>Data Loading...</h2>"
        footerContainer.innerHTML = ""
        try {
            resultToPrint = searchFokontany(event.target.value, dataString)

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

            footerContainer.innerHTML = ""
            if (error.toString().includes("null")) {
                containerForPrint.innerHTML = "<h2>Tsy misy anarana fokontany toy io ato.</h2>"
            }

            if (error.toString().includes("undefined")) {
                containerForPrint.innerHTML = ""
            }
        }
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
    tbodyTag.innerHTML = generateRowsOfTableOfResult(resultToPrint.slice(page - 1, page - 1 + RESULT_TO_PRINT_MAX))
    tableTag.innerHTML += tbodyTag.outerHTML
    containerForPrint.innerHTML = tableTag.outerHTML
}

document.addEventListener("DOMContentLoaded", () => {
    
    initData()
    inputFokontanyName.value = ""
    
    inputFokontanyName.addEventListener("keyup", handleOnChangeSearchInput)
    inputFokontanyName.addEventListener("focus", handleOnChangeSearchInput)
    
})