//Importing Functions From firebase.js
import { FacebookAuthProvider } from "firebase/auth/web-extension";
import { createProfessor, addSection, getSections, signOutUser, getAssignedStudents, deleteSection, updateClassSectionName, renameSection, getClassSectionTableDocuments } from "./utils/firebase";
let addEntityClicks = [];
let deleteQueue = [];
let renameQueue = [];
let renameQueueOne = [];
let debounceTimeout;

//Start of Admin Home Initializing DOM Elements Block
const addEntityButton = document.querySelector(".add-entity-button");
const logoutButton = document.querySelector(".header p");
const confirmDeletionButton = document.querySelector('.confirm-deletion-modal-confirm-button');
const confirmDeletionModal = document.querySelector('.confirm-deletion-modal-container');
const professorNavigationButton = document.querySelector('.professors-text-container');
const studentNavigationButton = document.querySelector('.students-text-container');
const classSectionNavigationButton = document.querySelector('.sections-text-container');
const professorTable = document.querySelector('.professor-table');
const studentTable = document.querySelector('.student-table');
const classSectionTable = document.querySelector('.class-section-table');

//Start of Professor Table Modals
const addProfessorModal = document.querySelector(".add-professor-modal-container");
const professorTableData = document.querySelector(".professor-table-data");
const editProfessorModal = document.querySelector(".edit-professor-modal-container");
const addSectionButton = document.querySelector(".edit-professor-modal-add-section-button");
const addSectionModal = document.querySelector(".add-section-modal-container");
const deleteSectionButton = document.querySelector(".edit-professor-modal-delete-section-button");
const deleteSectionModal = document.querySelector(".delete-section-modal-container");
const assignSection = document.querySelector(".add-professor-modal-assign-section-button");
const assignSectionModal = document.querySelector(".assign-section-modal-container");
const addProfessorForm = document.querySelector(".add-professor-form");
const addProfessorConfirm = document.querySelector(".add-professor-modal-confirm-button");
const removeSectionModal = document.querySelector('.remove-section-modal-container');
const removeSectionButton = document.querySelector('.add-professor-modal-remove-section-button');
//End of Professor Table Modals

//Start of Student Table Modals
const addStudentModal = document.querySelector(".add-student-modal-container");
const studentTableData = document.querySelector('.student-table-data');
const editStudentModal = document.querySelector('.edit-student-modal-container');
//End of Student Table Modals

//Start of Class Section Table Modals
const addClassSectionModal = document.querySelector(".add-class-section-modal-container");
const addSectionForm = document.querySelector(".add-class-section-form");
const classSectionTableDataContainer = document.querySelector('.class-section-table-data-container');
const editClassSectionModal = document.querySelector('.edit-class-section-modal-container');
const editClassSectionModalTableDataContainer = document.querySelector('.edit-class-section-modal-table-data-container');
const editClassSectionModalDeleteButton = document.querySelector('.edit-class-section-modal-delete-button');
const editClassSectionModalRenameButton = document.querySelector('.edit-class-section-modal-rename-button');
const closeEditClassSectionModal = document.querySelector('.edit-class-section-close-container');
const renameClassSectionModal = document.querySelector('.rename-section-modal-container');
const renameClassSectionForm = document.querySelector('.rename-section-form');
//End of Class Section Table Modals
//End of Admin Home Initializing DOM Elements Block

initializeHomepage();
function initializeHomepage() {
    // initializeProfessorTable();
    // initializeStudentTable();
    initializeClassSectionTable();

    // wakeProfessorNavigationButton();
    // wakeStudentNavigationButton();
    wakeAddEntityButton("professor");
    
    wakeClassSectionNavigationButton();//This will wake the addEntity button
    wakeClassSectionTableDataContainer();
}

function initializeClassSectionTable() { //This function displays the latest class section table record.
    classSectionTableDataContainer.innerHTML = "";
    getClassSectionTableDocuments().then((sectionsData) => {
        sectionsData.forEach((sectionData) => {
            const isDisplayed = Array.from(classSectionTableDataContainer.children).some(child => 
                child.querySelector('.class-section-name-container p')?.textContent == sectionData.name
            );

            if(!isDisplayed) {
                // Create the main container
                const classSectionTableData = createElementWithText('div', '', 'class-section-table-data');
                // Create and append child containers
                classSectionTableData.appendChild(createElementWithText('div', `<p>${sectionData.name}</p>`, 'class-section-name-container'));
                classSectionTableData.appendChild(createElementWithText('div', `<p>${sectionData.studentCount} / 40</p>`, 'class-section-slot-container'));
                classSectionTableData.appendChild(createElementWithText('div', `<p>${sectionData.assignedTo}</p>`, 'class-section-assigned-to-container'));

                classSectionTableDataContainer.appendChild(classSectionTableData); 
            }
        })
    });
}

function wakeClassSectionNavigationButton() {//Whenever the nav button is clicked it will also initialized the add entity button
    classSectionNavigationButton.addEventListener('click', classSectionNavigationButtonHandler);
} 
function classSectionNavigationButtonHandler() {// Handles class section navigation button click
    document.querySelector('.sections-text-container > p').style.setProperty('--after-background', '#ad1f48');
    document.querySelector('.professors-text-container > p').style.setProperty('--after-background', 'transparent');
    document.querySelector('.students-text-container > p').style.setProperty('--after-background', 'transparent');

    classSectionTable.style.display = "grid"
    professorTable.style.display = "none";
    studentTable.style.display = "none";
    
    wakeAddEntityButton("classSection");

    classSectionNavigationButton.removeEventListener('click', classSectionNavigationButtonHandler);
    wakeClassSectionNavigationButton();
}

function wakeClassSectionTableDataContainer() {
    classSectionTableDataContainer.addEventListener('click', classSectionTableDataContainerHandler);
}
function classSectionTableDataContainerHandler(classSectionTableDataContainerHanderEvent) {
    const classSectionName = classSectionTableDataContainerHanderEvent.target.querySelector('.class-section-name-container').textContent;
    editClassSectionModalTableDataContainer.innerHTML = "";
    getAssignedStudents(classSectionName).then((assignedStudents) => {
        assignedStudents.forEach((student) => {
            const editClassSectionModalTableData = createElementWithText('div', '', 'edit-class-section-modal-table-data');
            
            editClassSectionModalTableData.appendChild(createElementWithText('div', `<p>${student.idNumber}</p>`, 'edit-class-section-modal-table-data-student-id'));
            editClassSectionModalTableData.appendChild(createElementWithText('div', `<p>${student.name}</p>`, 'edit-class-section-modal-table-data-student-name'));
            
            editClassSectionModalTableDataContainer.appendChild(editClassSectionModalTableData);
        });
    }).catch((error) => {

    });
    
    editClassSectionModal.style.display = "flex";

    closeEditClassSectionModal.addEventListener('click', function () {
        editClassSectionModal.style.display = "none";
    });
    wakeEditClassSectionModalDeleteButton(classSectionName);
    wakeEditClassSectionModalRenameButton(classSectionName);
}

function wakeEditClassSectionModalRenameButton(classSectionName) {
    editClassSectionModalRenameButton.addEventListener('click', () => editClassSectionModalRenameButtonHandler(classSectionName), {once : true});
    renameQueue.push(classSectionName);
}
function editClassSectionModalRenameButtonHandler(classSectionName) {
    if(renameQueue.length == 1) {
        renameClassSectionModal.style.display = "flex";

        document.querySelector('.rename-section-modal-close-container').addEventListener('click', function () {
            renameClassSectionModal.style.display = "none";
            wakeEditClassSectionModalRenameButton(classSectionName);
        });

        renameClassSectionForm.addEventListener('submit', (renameClassSectionFormHandlerEvent) => renameClassSectionFormHandler(renameClassSectionFormHandlerEvent, classSectionName), {once : true});
        renameQueueOne.push(classSectionName);
    }
    renameQueue.pop();  
}

function renameClassSectionFormHandler(renameClassSectionFormHandlerEvent, classSectionName) {
    if(renameQueueOne.length == 1) {
        renameClassSectionFormHandlerEvent.preventDefault();

        const newClassSectionName = renameClassSectionForm.new_class_section_name.value;
    
        updateClassSectionName(classSectionName, newClassSectionName).then((message) => {
            console.log(message);
            
            initializeClassSectionTable();
        });
        renameClassSectionModal.style.display = "none";
        editClassSectionModal.style.display = "none";
        classSectionTableDataContainer.removeEventListener('click', classSectionTableDataContainerHandler);
        wakeClassSectionTableDataContainer();
    }
    renameQueueOne.pop();
}


function wakeEditClassSectionModalDeleteButton(classSectionName) {
    editClassSectionModalDeleteButton.addEventListener('click', () => editClassSectionModalDeleteButtonHandler(classSectionName), {once : true});
    deleteQueue.push(classSectionName);
}
function editClassSectionModalDeleteButtonHandler(classSectionName) {
    if(deleteQueue.length == 1) {
        deleteSection(classSectionName).then((message) => {
            console.log(message);
            initializeClassSectionTable();
        })
        editClassSectionModal.style.display = "none";
        classSectionTableDataContainer.removeEventListener('click', classSectionTableDataContainerHandler);
        wakeClassSectionTableDataContainer();
    }
    deleteQueue.pop();
}

function wakeAddEntityButton(from) {
    addEntityButton.addEventListener('click', () => {
        addEntityHandler(from);

        
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            addEntity();
        }, 500);
    });
}

function addEntityHandler(from) {
    addEntityClicks.push(from);
}

function addEntity() {
    if (addEntityClicks[addEntityClicks.length - 1] === "professor") {
        console.log("Add Professor");
    } else if (addEntityClicks[addEntityClicks.length - 1] === "classSection") {
        addSectionForm.addEventListener('submit', addSectionFormHandler);
        addClassSectionModal.style.display = "flex";

        console.log("Add Class Sections");

        document.querySelector(".add-class-section-modal-close-container").addEventListener("click", function () {
            addClassSectionModal.style.display = "none"; 
        });
    } else {
        console.log("Add Student");
    }
}

function addSectionFormHandler(addSectionFormHandlerEvent) {
    addSectionFormHandlerEvent.preventDefault();
    
    const classSectionName = addSectionForm.class_section_name.value;
    
    addSection(classSectionName).then(() => {
        initializeClassSectionTable();
        addSectionForm.reset();
        addClassSectionModal.style = "none";
    }).catch((err) => {
        console.log(err.message);
    });
    
    addSectionForm.removeEventListener('submit', addSectionFormHandler);
    addEntityButton.removeEventListener('click', wakeAddEntityButton);

    wakeAddEntityButton("classSection"); 
}


// Helper Function to Create an Element and Set Its Text Content
const createElementWithText = (tag, text, className) => {
    const element = document.createElement(tag);
    element.className = className;
    element.innerHTML = text;
    return element;
};


//If the logout button is insight execute the if statement.
if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        signOutUser().then((homepage) => {
            window.location.href = homepage;
        });
    }, {once : true});// Automatically reset event listeners once the session ends.
}