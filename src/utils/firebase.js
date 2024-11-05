import { initializeApp } from "firebase/app";
import {
    collection,
    getDocs,
    getFirestore,
    query,
    where,
    addDoc,
    getDoc,
    getCountFromServer,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    DocumentReference,
    onSnapshot
} from "firebase/firestore";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCGAVs4Mh55FPXaaE1zIq8W84MKz4JN7C4",
    authDomain: "tutoriweb-a6edc.firebaseapp.com",
    projectId: "tutoriweb-a6edc",
    storageBucket: "tutoriweb-a6edc.appspot.com",
    messagingSenderId: "591065376755",
    appId: "1:591065376755:web:a98e19a616691bb5ce5486",
    measurementId: "G-MYGEKJLWL3",
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const authentication = getAuth(app);


export const createProfessor = async (email, password, userType) => {
    const cred = await createUserWithEmailAndPassword(authentication, email, password)
    const docRef = await addUserToDB(cred.user.uid, userType, email);
    if (userType == 'professor') {
        await addProfessorDetails()
    }
}

export const signIn = async (username, password) => {
    const credentials = await signInWithEmailAndPassword(authentication, username, password)
    const uid = credentials.user.uid;
    const usersCollectionReference = collection(database, "users");
    const usersQuery = query(usersCollectionReference, where("uid", "==", uid));
    const userSnapshot = await getDocs(usersQuery);

    if (userSnapshot.docs[0].data().user_type == "admin") {
        return "Admin/admin_home.html";
    } else {
        return "Teacher/teacher_home.html";
    }
}
const addUserToDB = async (uid, userType, email) => {
    const docRef = await addDoc(collection(database, "users"), {
        uid: uid,
        user_type: userType,
        username: email
    });
    return docRef;
}

const addProfessorDetails = async () => {

}
const getProfessors = async () => {
 
}

export const updateClassSectionName = async (oldClassSectionName, newClassSectionName) => {
    const sectionsCollectionReference = collection(database, "classSections");
    const sectionsQuery = query(sectionsCollectionReference, where("name", "==", oldClassSectionName));
    
    const sectionsSnapShot = await getDocs(sectionsQuery);

    if (sectionsSnapShot.empty) {
        throw new Error(`No document found with name: ${oldClassSectionName}`);
    }

    const documentRef = sectionsSnapShot.docs[0].ref;

    try {
        await updateDoc(documentRef, { name: newClassSectionName });
        
        return `Document name updated to ${newClassSectionName} successfully.`;
    } catch (error) {
        throw new Error(`Failed to update document: ${error.message}`);
    }
};


export const getSections = async () => {
    const sections = await getDocs(collection(database, "classSections"));
    const sectionDataArray = [];
    
    for (const section of sections.docs) {
        const name = section.data().name;
        const assignedTo = section.data().assignedTo;
        const studentsSubcollectionReference = collection(section.ref, "students");
        const studentCountSnapshot = await getCountFromServer(studentsSubcollectionReference);
        const studentCount = studentCountSnapshot.data().count;
        const sectionData = {name, assignedTo, studentCount};
        sectionDataArray.push(sectionData);
    }
    return sectionDataArray;
}
//Pwede na pag isahin sa isang function
//Subscribe snapshot to students subcollection and return their data
export const getAssignedStudents = async (classSectionName) => { 
    let assignedStudentsArray = [];
    const classSectionsCollectionReference = collection(database, "classSections");
    const classSectionQuery = query(classSectionsCollectionReference, where("name", "==", classSectionName));
    const classSectionSnapshot = await getDocs(classSectionQuery);

    const classSectionDocument = classSectionSnapshot.docs[0];     

    const studentsSubcollectionReference = collection(classSectionDocument.ref, "students");
    const studentsSnapshot = await getDocs(studentsSubcollectionReference);

    // Step 4: Extract and return the student documents
    studentsSnapshot.forEach((student) => {
        const idNumber = student.data().idnumber;
        const name = student.data().name;
        assignedStudentsArray.push({name, idNumber});
    });
    
    return assignedStudentsArray;
    // Returns an array of document references matching the query
    // const sectionsReference = collection(database, "classSections");
    // const sectionsQuery = query(sectionsReference, where("name", "==", classSectionName));
    // const sectionsSnapshot = await getDocs(sectionsQuery);

    // const assignedStudentsArray = [];
    
    // if(!sectionsSnapshot.empty) {
    //     const sectionDocument = sectionsSnapshot.docs[0];
    //     const studentsSubcollectionReference = collection(sectionDocument.ref, "students");
    //     const assignedStudentsSnapshot = await getDocs(studentsSubcollectionReference);
        
    //     assignedStudentsSnapshot.forEach((students) => {
    //         assignedStudentsArray.push(students.data());
    //     });
    //     return assignedStudentsArray;
    // } else {
    //     //Throws message
    // }
}

export const deleteSection = async (classSectionName) => {
    const sectionsCollectionReference = collection(database, "classSections");
    const sectionsQuery = query(sectionsCollectionReference, where("name", "==", classSectionName));
    const sectionsSnapShot = await getDocs(sectionsQuery);
    
    if (sectionsSnapShot.empty) {
        throw new Error("Document not found. Deletion cannot proceed.");
    }

    await deleteDoc(doc(database, "classSections", sectionsSnapShot.docs[0].id));

    return "Document deleted successfully";
};      

export const renameSection = async (classSectionName) => {
    const sectionsCollectionReference = collection(database, "classSections");
    const sectionsQuery = query(sectionsCollectionReference, where("name", "==", classSectionName));
    const sectionsSnapShot = await getDocs(sectionsQuery);

    await setDoc(doc(sectionsCollectionReference, sectionsSnapShot.docs[0].id, { name: "NewSectionName" }));

    return "Section has been renamed";
}
//------ ------ ------ ------

export const signOutUser = async () => {
    signOut(authentication);
    return "../login.html";
}

export const getAuthentication = () => {
    return authentication;
}

export const getProfessorTableDocuments =  async () => {
    //Return class section documents
}
export const getStudentTableDocuments =  async () => {
    //Return class section documents
}
export const addSection = async (classSectionName) => {
    const sectionDocumentReference = await addDoc(collection(database, "classSections"), {
        name: classSectionName,
        assignedTo: ""
    });
    const studentsSubcollectionReference = collection(sectionDocumentReference,"students");
    await addDoc(studentsSubcollectionReference, {
        idnumber : "202110233",
        name : "Khandaker, Khalid Uzzaman T."
    });
}

export const getClassSectionTableDocuments = async () => {
    const classSectionCollectionReference = collection(database, "classSections");
    
    return new Promise((resolve) => {
        onSnapshot(classSectionCollectionReference, async (classSectionsSnapshot) => {
            let sectionsData = [];

            const promises = classSectionsSnapshot.docs.map(async (section) => {
                const name = section.data().name;
                const assignedTo = section.data().assignedTo;

                const studentCount = await countSubcollection(section.ref, "students");

                return { name, assignedTo, studentCount };  
            });
            sectionsData = await Promise.all(promises);
            resolve(sectionsData);
        });
    });
};

async function countSubcollection(documentReference, subCollectionName) {
    const studentsSubcollectionReference = collection(documentReference, subCollectionName);
    const studentCountSnapshot = await getCountFromServer(studentsSubcollectionReference);
    return studentCountSnapshot.data().count;
}
