let filterButtonActive = false;
let jsonData = [];

async function fetchData() {
    try {
        const response = await fetch("launch.json");
        if (!response.ok) throw new Error("Failed to fetch data.");
        jsonData = await response.json();
        initialize();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function populateTable(data) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");
        
        // Add row number
        const rowNumberCell = document.createElement("td");
        rowNumberCell.textContent = index + 1;
        row.appendChild(rowNumberCell);

        ["HUL Code", "HUL Outlet Name", "ME Name", "DETS Beat", "BasePack Code", "BasePack Desc", "Target (VMQ)", "Achv Qty", "Status"].forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = item[key] || "";
            row.appendChild(cell);
        });
        
        tableBody.appendChild(row);
    });
}

function applyFilters() {
    let filteredData = [...jsonData];

    const filters = {
        "ME Name": document.getElementById("filter-me-name").value,
        "DETS Beat": document.getElementById("filter-dets-beat").value,
        "BasePack Desc": document.getElementById("filter-basepack-desc").value
    };

    const searchQuery = document.getElementById("search-bar").value.toLowerCase();

    filteredData = filteredData.filter(row => 
        (!filters["ME Name"] || row["ME Name"] === filters["ME Name"]) &&
        (!filters["DETS Beat"] || row["DETS Beat"] === filters["DETS Beat"]) &&
        (!filters["BasePack Desc"] || row["BasePack Desc"] === filters["BasePack Desc"]) &&
        (!searchQuery || row["HUL Code"].toLowerCase().includes(searchQuery) || row["HUL Outlet Name"].toLowerCase().includes(searchQuery))
    );
    
    if (filterButtonActive) {
        filteredData = filteredData.filter(row => row["Status"] === "Pending");
    }

    populateTable(filteredData);
    updateDropdowns(filteredData);
}

function updateDropdowns(filteredData) {
    const headers = ["ME Name", "DETS Beat", "BasePack Desc"];
    const options = headers.reduce((acc, key) => {
        acc[key] = new Set(filteredData.map(row => row[key]).filter(Boolean));
        return acc;
    }, {});
    
    headers.forEach(header => populateSelectDropdown(`filter-${header.toLowerCase().replace(/ /g, '-')}`, options[header], header));
}

function populateSelectDropdown(id, optionsSet, columnName) {
    const dropdown = document.getElementById(id);
    const selectedValue = dropdown.value;
    dropdown.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.textContent = columnName;
    defaultOption.value = "";
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);

    optionsSet.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.textContent = option;
        optionElement.value = option;
        if (option === selectedValue) optionElement.selected = true;
        dropdown.appendChild(optionElement);
    });
}

document.getElementById("reset-button").addEventListener("click", () => {
    filterButtonActive = false;
    document.getElementById("filter-button-1").style.backgroundColor = "blue";
    document.getElementById("search-bar").value = "";
    ["filter-me-name", "filter-dets-beat", "filter-basepack-desc"].forEach(id => document.getElementById(id).selectedIndex = 0);
    applyFilters();
});

document.getElementById("search-bar").addEventListener("input", applyFilters);
document.getElementById("filter-me-name").addEventListener("change", applyFilters);
document.getElementById("filter-dets-beat").addEventListener("change", applyFilters);
document.getElementById("filter-basepack-desc").addEventListener("change", applyFilters);

document.getElementById("filter-button-1").addEventListener("click", () => {
    filterButtonActive = !filterButtonActive;
    document.getElementById("filter-button-1").style.backgroundColor = filterButtonActive ? "green" : "blue";
    applyFilters();
});

function initialize() {
    populateTable(jsonData);
    applyFilters();
}

fetchData();
