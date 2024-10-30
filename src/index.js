//Importing Functions From firebase.js
import { createProfessor, addSection, getSections, signOutUser, getAssignedStudents, deleteSection, renameSection, getClassSectionTable } from "./utils/firebase";

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
const addSectionsForm = document.querySelector(".add-class-section-form");
const classSectionTableDataContainer = document.querySelector('.class-section-table-data-container');
const editClassSectionModal = document.querySelector('.edit-class-section-modal-container');
const editClassSectionModalTableDataContainer = document.querySelector('.edit-class-section-modal-table-data-container');
//End of Class Section Table Modals
//End of Admin Home Initializing DOM Elements Block

// initializeTables();
// function initializeTables() {
//     initializeProfessorTable();
//     initializeStudentTable();
//     initializeClassSectionTable();

    
// }

// function initializeProfessorTable() {
//     getProfessorTableDocuments.then((tableData) => {
//         tableData.forEach(data => {
//             //Get table container and display the data
//         });
//     });
// }
// function initializeStudentTable() {
//     getStudentTableDocuments.then((tableData) => {
//         tableData.forEach(data => {
//             //Get table container and display the data
//         });
//     });
// }
// function initializeClassSectionTable() {
//     getClassSectionTable.then((tableData) => {
//         tableData.forEach(data => {
//             //Get table container and display the data
//         });
//     });
// }

// Helper Function to Create an Element and Set Its Text Content
const createElementWithText = (tag, text, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.innerHTML = text;
    return element;
};

function initializedSectionTable() {
    getSections().then((sectionData) => {
        sectionData.forEach((section) => {
            const isDisplayed = Array.from(classSectionTableDataContainer.children).some(child => 
                child.querySelector('.class-section-name-container p')?.textContent == section.name
            );

            if(!isDisplayed) {
                // Create the main container
                const classSectionTableData = createElementWithText('div', '', 'class-section-table-data');
                // Create and append child containers
                classSectionTableData.appendChild(createElementWithText('div', `<p>${section.name}</p>`, 'class-section-name-container'));
                classSectionTableData.appendChild(createElementWithText('div', `<p>${section.studentCount} / 40</p>`, 'class-section-slot-container'));
                classSectionTableData.appendChild(createElementWithText('div', `<p>${section.assignedTo}</p>`, 'class-section-assigned-to-container'));
                classSectionTableDataContainer.appendChild(classSectionTableData); 
            }
        })
    })
}

if (professorNavigationButton) {
    professorNavigationButton.addEventListener('click', function (event) {
        setActive(event);

        addTableDataButton(event);
    });
}

if(studentNavigationButton) {
    studentNavigationButton.addEventListener('click', function (event) {
        setActive(event);
    
        addTableDataButton(event);
    });
}

function setActive(event) {
    if(event.target.textContent == "Professors") {
        document.querySelector('.students-text-container > p').style.setProperty('--after-background', 'transparent');
        document.querySelector('.professors-text-container > p').style.setProperty('--after-background', '#ad1f48');
        document.querySelector('.sections-text-container > p').style.setProperty('--after-background', 'transparent');
    
        studentTable.style.display = "none";
        professorTable.style.display = "grid";
        classSectionTable.style.display = "none";
    } else if (event.target.textContent == "Students") {
        document.querySelector('.students-text-container > p').style.setProperty('--after-background', '#ad1f48');
        document.querySelector('.professors-text-container > p').style.setProperty('--after-background', 'transparent');
        document.querySelector('.sections-text-container > p').style.setProperty('--after-background', 'transparent');
    
        studentTable.style.display = "grid";
        professorTable.style.display = "none";
        classSectionTable.style.display = "none";
    } else if (event.target.textContent == "Sections") {
        document.querySelector('.sections-text-container > p').style.setProperty('--after-background', '#ad1f48');
        document.querySelector('.professors-text-container > p').style.setProperty('--after-background', 'transparent');
        document.querySelector('.students-text-container > p').style.setProperty('--after-background', 'transparent');
    
        classSectionTable.style.display = "grid"
        professorTable.style.display = "none";
        studentTable.style.display = "none";
    }
}

if(classSectionNavigationButton) {//This if statement will execute once the admin homepage is displayed 
    initializedSectionTable();//Load all sections to the table 

    classSectionNavigationButton.addEventListener('click', function (event) { // If triggered will change the view to class section
        setActive(event);//Changes underline color when clicked
 
        addTableDataButton(event);//Function for adding data to the table

        classSectionTableDataContainer.addEventListener('click', function(classSectionTableEvent) {//Display class section data modal if clicked
            const sectionName = classSectionTableEvent.target.querySelector('.class-section-name-container').textContent;

            getAssignedStudents(sectionName).then((assignedStudents) => {
                assignedStudents.forEach((student) => {
                    const isDisplayed = Array.from(editClassSectionModalTableDataContainer.children).some(child => 
                        child.querySelector('.edit-class-section-modal-table-data-student-id p')?.textContent === student.idnumber
                    );
                    
                    if(!isDisplayed) {
                        const editClassSectionModalTableData = createElementWithText('div', '', 'edit-class-section-modal-table-data');
                    
                        editClassSectionModalTableData.appendChild(createElementWithText('div', `<p>${student.idnumber}</p>`, 'edit-class-section-modal-table-data-student-id'));
                        editClassSectionModalTableData.appendChild(createElementWithText('div', `<p>${student.name}</p>`, 'edit-class-section-modal-table-data-student-name'));
                        
                        editClassSectionModalTableDataContainer.appendChild(editClassSectionModalTableData);
                    }
                });
            }).catch((error) => {

            });
            editClassSectionModal.style.display = "flex";

            editClassSectionModal.addEventListener('click', (event) => {
                if(event.target.textContent == "Delete") {
                    deleteSection(sectionName).then((message) => {
                        console.log(message);
                        classSectionTableEvent.target.remove();
                        editClassSectionModal.style.display = "none";
                        initializedSectionTable();
                    });
                } else if (event.target.textContent == "Rename") {
                    renameSection(sectionName).then((message) => {
                        console.log(message);
                        classSectionTableEvent.target.remove();
                        editClassSectionModal.style.display = "none";
                        initializedSectionTable();
                    });
                } else {
                    console.log("Closed");
                }
            }, {once : true});

            document.querySelector('.edit-class-section-close-container').addEventListener('click', function() {
                editClassSectionModal.style.display = "none";
            }, {once : true});
        });
    });
}

if (professorTableData && editProfessorModal) {
    professorTableData.addEventListener("click", function () {
        editProfessorModal.style.display = "flex";
        document.querySelector(".edit-professor-modal-close-container").addEventListener("click", function () {
            professorTableData.removeEventListener;
            this.removeEventListener;
            editProfessorModal.style.display = "none";
        });
        document.querySelector('.edit-professor-modal-delete-button').addEventListener("click", function () {
            confirmDeletionModal.style.display = "flex";
            document.querySelector('.confirm-deletion-modal-close-container').addEventListener('click', function () {
                confirmDeletionModal.style.display = "none";
            });
        });
        if (addSectionButton && addSectionModal) {
            addSectionButton.addEventListener("click", function () {
                addSectionModal.style.display = "flex";
                document
                    .querySelector(".add-section-modal-close-container")
                    .addEventListener("click", function () {
                        this.removeEventListener;
                        addSectionModal.style.display = "none";
                    });
            });
        }
        if (deleteSectionButton && deleteSectionModal) {
            deleteSectionButton.addEventListener("click", function () {
                deleteSectionModal.style.display = "flex";
                document.querySelector(".delete-section-modal-close-container")
                    .addEventListener("click", function () {
                        this.removeEventListener;
                        deleteSectionModal.style.display = "none";
                    });
            });
        }
    });
}

if (studentTableData) {
    studentTableData.addEventListener('click', function () {
        editStudentModal.style.display = "flex";
        document.querySelector('.edit-student-modal-close-container').addEventListener('click', function () {
            editStudentModal.style.display = 'none';
        });
        document.querySelector('.edit-student-modal-delete-button').addEventListener('click', function () {
            confirmDeletionModal.style.display = 'flex';
            confirmDeletionButton.addEventListener('click', function () {
                confirmDeletionModal.style.display = 'none';
                editStudentModal.style.display = 'none';
            });
        });
    });
}


function addTableDataButton(event) {
    addEntityButton.addEventListener("click", function () {
        if (event === undefined || event.target.innerHTML == "Professors") {
            addStudentModal.style.display = "none";
            addClassSectionModal.style.display = "none";
            addProfessorModal.style.display = "flex";
            document.querySelector(".add-professor-modal-close-container").addEventListener("click", function () {
                addEntityButton.removeEventListener;
                this.removeEventListener;
                addProfessorModal.style.display = "none";
            });

            removeSectionButton.addEventListener('click', function () {
                removeSectionModal.style.display = "flex";
                document.querySelector('.remove-section-modal-close-container').addEventListener('click', function () {
                    removeSectionModal.style.display = "none";
                });
            });

            assignSection.addEventListener("click", function () {
                assignSectionModal.style.display = "flex";
                document.querySelector(".assign-section-modal-close-container").addEventListener("click", function () {
                    assignSection.removeEventListener;
                    this.removeEventListener;
                    assignSectionModal.style.display = "none";
                });
            });

            addProfessorConfirm.addEventListener("click", () => {
                const email = addProfessorForm.professor_email.value;
                const password = addProfessorForm.professor_password.value;
                const name = addProfessorForm.professor_name.value;
                createProfessor(email, password, "professor").then(() => {
                    addProfessorForm.reset();
                    addProfessorModal.style = "none";
                }).catch((err) => {
                    console.log(err.message);
                });
            });
        
        } else if (event.target.innerHTML === "Students") {
            addProfessorModal.style.display = "none";
            addClassSectionModal.style.display = "none";
            addStudentModal.style.display = "flex";
            document.querySelector(".add-student-modal-close-container").addEventListener("click", function () {
                addEntityButton.removeEventListener;
                this.removeEventListener;
                addStudentModal.style.display = "none";
            });

        } else if (event.target.innerHTML === "Sections") { 
            addProfessorModal.style.display = "none";
            addStudentModal.style.display = "none";
            addClassSectionModal.style.display = "flex";

            addSectionsForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const name = addSectionsForm.class_section_name.value;

                addSection(name).then(() => {
                    addSectionsForm.reset();
                    addClassSectionModal.style = "none";
                    console.log("Section Created Successfully!");//Student subcollection cannot count 
                }).catch((err) => {
                    console.log(err.message);
                });
                initializedSectionTable();
                addClassSectionModal.style.display = "none";
            }, {once : true});
            document.querySelector(".add-class-section-modal-close-container").addEventListener("click", function () {
                addEntityButton.removeEventListener;
                this.removeEventListener;
                addClassSectionModal.style.display = "none"; 
                window.location.reload();
            });
        }
    });
}


//FOR UPDATING USER PASSWORD by ADMIN
//const admin = require('firebase-admin');
// const uid = 'USER_UID'; // The UID of the user whose password you want to change
// const newPassword = 'newPassword123'; // The new password

// admin.auth().updateUser(uid, {
//     password: newPassword
// })
// .then((userRecord) => {
//     console.log('Successfully updated user', userRecord.toJSON());
// })
// .catch((error) => {
//     console.error('Error updating user:', error);
// });


//If the logout button is insight execute the if statement.
if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        signOutUser().then((homepage) => {
            window.location.href = homepage;
        });
    }, {once : true});// Automatically reset event listeners once the session ends.
}