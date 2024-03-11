let searchTest = "Ambatoroka"
const regExp = new RegExp(`\{"commune":"[\w '-_\(\)]+","region":"[\w '-_\(\)]+","fokontany":"[\w '-_\(\)]*${searchTest}[\w '-_\(\)]*","district":"[\w '-_\(\)]+"\}`, "ig")

const searchFokontanyTest = (data, regExp) => {
    return data.match(regExp)
}