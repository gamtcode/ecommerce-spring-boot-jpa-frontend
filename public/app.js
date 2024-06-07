"use strict";
// Base URLs for each service
const userURL = 'https://ecommerceapi.guilhermeteixeira.dev/users';
const orderURL = 'https://ecommerceapi.guilhermeteixeira.dev/orders';
const productURL = 'https://ecommerceapi.guilhermeteixeira.dev/products';
const categoryURL = 'https://ecommerceapi.guilhermeteixeira.dev/categories';
// Function to create an input form based on the attributes of an entity
function createForm(entity, operation) {
    let formHTML = '';
    for (let attribute in entity) {
        if (operation === 'create' && attribute === 'id')
            continue;
        if ((operation === 'read' || operation === 'delete') && attribute !== 'id')
            continue;
        let placeholderText = '';
        if (operation === 'read' && attribute === 'id') {
            placeholderText = 'Leave blank to fetch all entities';
        }
        formHTML += `
        <div class="input-group">
            <label for="${attribute}">${attribute}</label>
            <input id="${attribute}" name="${attribute}" type="text" placeholder="${placeholderText}">
        </div><br>`;
    }
    return formHTML;
}
// Function to format the response
function formatResponse(data, level = 0) {
    const indent = '&nbsp;'.repeat(level * 2);
    if (Array.isArray(data)) {
        return data.map((item, index) => {
            const formattedItem = formatResponse(item, level + 1);
            return level === 0 && index < data.length - 1 ? formattedItem + '<br>' : formattedItem;
        }).join('<br>');
    }
    else {
        const orderedData = {
            'id': data['id'],
            'moment': data['moment'],
            'orderStatus': data['orderStatus'],
            'total': data['total'],
            'payment': data['payment'],
            'client': data['client'],
            'items': data['items'],
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'password': data['password'],
            'quantity': data['quantity'],
            'price': data['price'],
            'subTotal': data['subTotal'],
            'product': data['product'],
            'description': data['description'],
            'imgUrl': data['imgUrl'],
            'categories': data['categories']
        };
        return Object.entries(orderedData)
            .filter(([key]) => data[key] !== undefined)
            .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return `${indent}${key.charAt(0).toUpperCase() + key.slice(1)}:<br>${formatResponse(value, level + 1)}`;
            }
            else {
                return `${indent}${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
            }
        })
            .join('<br>');
    }
}
// Function to perform a CRUD operation
function performOperation(entityURL, operation, entity) {
    let url = entityURL;
    let options = {};
    switch (operation) {
        case 'create':
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            };
            break;
        case 'read':
            url += entity.id ? `/${entity.id}` : '';
            options = { method: 'GET' };
            break;
        case 'update':
            url += `/${entity.id}`;
            options = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            };
            break;
        case 'delete':
            url += `/${entity.id}`;
            options = { method: 'DELETE' };
            break;
    }
    fetch(url, options)
        .then(response => {
        if (response.status === 204 || response.status === 205) {
            return null;
        }
        else {
            return response.json();
        }
    })
        .then(data => {
        console.log(data);
        if (data) {
            document.getElementById('response').innerHTML = formatResponse(data);
        }
        else {
            document.getElementById('response').textContent = 'Operation completed successfully';
        }
    })
        .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').textContent = 'Error: ' + error;
    });
}
// Function to handle the selection of entity and operation
function handleSelection(entitySelect, operationSelect, isEntityChange) {
    let entityURL = '';
    let entity = {};
    let operationOptions = ['Select an operation'];
    switch (entitySelect.value) {
        case 'user':
            entityURL = userURL;
            entity = { id: null, name: null, email: null, phone: null };
            operationOptions = ['Select an operation', 'create', 'read', 'update', 'delete'];
            break;
        case 'order':
            entityURL = orderURL;
            entity = { id: null, userId: null, productIds: [] };
            operationOptions = ['Select an operation', 'read'];
            break;
        case 'product':
            entityURL = productURL;
            entity = { id: null, name: null, categoryId: null };
            operationOptions = ['Select an operation', 'read'];
            break;
        case 'category':
            entityURL = categoryURL;
            entity = { id: null, name: null };
            operationOptions = ['Select an operation', 'read'];
            break;
    }
    operationOptions = operationOptions.map(op => op.charAt(0).toUpperCase() + op.slice(1));
    if (isEntityChange) {
        operationSelect.innerHTML = operationOptions.map(op => `<option value="${op.toLowerCase()}">${op}</option>`).join('');
        document.getElementById('formContainer').innerHTML = '';
        document.getElementById('submitButton').style.display = 'none'; // Hide the "Submit" button
        document.getElementById('clearButton').style.display = 'none'; // Hide the "Clear result" button
    }
    if (!isEntityChange && operationSelect.value !== 'Select an operation') {
        document.getElementById('formContainer').innerHTML = createForm(entity, operationSelect.value);
        document.getElementById('submitButton').style.display = 'block'; // Make the "Submit" button visible
        document.getElementById('clearButton').style.display = 'block'; // Make the "Clear result" button visible
    }
    document.getElementById('submitButton').onclick = () => {
        for (let attribute in entity) {
            if (operationSelect.value === 'create' && attribute === 'id')
                continue;
            if ((operationSelect.value === 'read' || operationSelect.value === 'delete') && attribute !== 'id')
                continue;
            entity[attribute] = document.getElementById(attribute).value;
        }
        performOperation(entityURL, operationSelect.value, entity);
    };
    // Add functionality to the "Clear result" button
    document.getElementById('clearButton').onclick = () => {
        document.getElementById('response').innerHTML = '';
    };
}
// Add event listeners for the selects
document.getElementById('entitySelect').onchange = function () {
    handleSelection(this, document.getElementById('operationSelect'), true);
};
document.getElementById('operationSelect').onchange = function () {
    handleSelection(document.getElementById('entitySelect'), this, false);
};
