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

export const addSection = async (name) => {
    const sectionDocumentReference = await addDoc(collection(database, "sections"), {
        name: name,
        assignedTo: ""
    });
    const studentsSubcollectionReference = collection(sectionDocumentReference,"students");
    await addDoc(studentsSubcollectionReference, {
        idnumber : "202110233",
        name : "Khandaker, Khalid Uzzaman T."
    });
}

export const getSections = async () => {
    const sections = await getDocs(collection(database, "sections"));
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
export const getAssignedStudents = async (classSectionName) => {
    const sectionsReference = collection(database, "sections");
    const sectionsQuery = query(sectionsReference, where("name", "==", classSectionName));
    const sectionsSnapshot = await getDocs(sectionsQuery);

    const assignedStudentsArray = [];
    
    if(!sectionsSnapshot.empty) {
        const sectionDocument = sectionsSnapshot.docs[0];
        const studentsSubcollectionReference = collection(sectionDocument.ref, "students");
        const assignedStudentsSnapshot = await getDocs(studentsSubcollectionReference);
        
        assignedStudentsSnapshot.forEach((students) => {
            assignedStudentsArray.push(students.data());
        });
        return assignedStudentsArray;
    } else {
        //Throws message
    }
}

export const deleteSection = async (classSectionName) => {
    const sectionsCollectionReference = collection(database, "sections");
    const sectionsQuery = query(sectionsCollectionReference, where("name", "==", classSectionName));
    const sectionsSnapShot = await getDocs(sectionsQuery);
    
    await deleteDoc(doc(database, "sections", sectionsSnapShot.docs[0].id));

    return "Docuemnt deleted successfully";
}       

export const renameSection = async (classSectionName) => {
    const sectionsCollectionReference = collection(database, "sections");
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
export const getClassSectionTableDocuments =  async () => {
    const classSectionCollectionReference = collection(database, "sections");
    onSnapshot(classSectionCollectionReference, (classSectionsSnapshot) => {
        let sections = [];
        classSectionsSnapshot.docs.forEach((section) => {
            
        })
    }); 
}