document.addEventListener('DOMContentLoaded', () => {
    let invigilators = [];
    let datesTimes = [];
    let classrooms = [];
    let students = [];
    let examName = '';
    let sectionsToAdd = [];

    // File Upload Handlers
    document.getElementById('invigilatorsFile').addEventListener('change', handleFile(invigilators));
    document.getElementById('datesTimesFile').addEventListener('change', handleFile(datesTimes));
    document.getElementById('classroomsFile').addEventListener('change', handleFile(classrooms));
    document.getElementById('studentsFile').addEventListener('change', handleFile(students));

    function handleFile(dataArray) {
        return (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const workbook = XLSX.read(e.target.result, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                dataArray.length = 0; // Clear existing data
                jsonData.slice(1).forEach(row => dataArray.push(row));
                console.log("File loaded", dataArray);
            };

            reader.readAsArrayBuffer(file);
        };
    }

    // Manual Inputs
    document.getElementById('generateTimetable').addEventListener('click', () => {
        examName = document.getElementById('examName').value;
        sectionsToAdd = document.getElementById('sectionsToAdd').value.split(',').map(s => s.trim());
        generateTimetableAndSeating();
    });

    function generateTimetableAndSeating() {
        // Basic Conflict Checking and Timetable Generation Logic
        if (!invigilators.length || !datesTimes.length || !classrooms.length || !students.length || !examName || !sectionsToAdd.length) {
            alert('Please provide all necessary data.');
            return;
        }

        const timetable = {};
        const studentSeating = {};
        const classroomsData = classrooms.reduce((acc, classroom) => {
            acc[classroom[1]] = {
                totalStrength: classroom[2],
                rows: classroom.slice(3)
            };
            return acc;
        }, {});

        // Basic timetable generation logic (expand as needed)
        datesTimes.forEach(dateTime => {
            const date = dateTime[1];
            const time = dateTime[2];
            timetable[`${date} ${time}`] = {};

            classrooms.forEach(classroom => {
                const classroomName = classroom[1];
                timetable[`${date} ${time}`][classroomName] = {
                    students: [],
                    invigilator: null
                };
            });
        });

        // Basic student assignment logic (expand as needed)
        let studentIndex = 0;
        let classroomIndex = 0;
        let dateTimeIndex = 0;

        students.forEach(student => {
            if (sectionsToAdd.includes(student[3])) {
                const dateTimeKey = Object.keys(timetable)[dateTimeIndex];
                const classroomKey = Object.keys(timetable[dateTimeKey])[classroomIndex];
                
                if (timetable[dateTimeKey][classroomKey].students.length < classroomsData[classroomKey].totalStrength) {
                    timetable[dateTimeKey][classroomKey].students.push(student);
                    studentSeating[student[1]] = {
                        date: dateTimeKey.split(' ')[0],
                        time: dateTimeKey.split(' ')[1],
                        classroom: classroomKey
                    };
                    classroomIndex = (classroomIndex + 1) % Object.keys(timetable[dateTimeKey]).length;
                } else {
                    classroomIndex = (classroomIndex + 1) % Object.keys(timetable[dateTimeKey]).length;
                    dateTimeIndex = (dateTimeIndex + 1) % Object.keys(timetable).length;
                }
            }
        });

        // Basic invigilator assignment
        Object.keys(timetable).forEach(dateTimeKey => {
            Object.keys(timetable[dateTimeKey]).forEach(classroomKey => {
                timetable[dateTimeKey][classroomKey].invigilator = invigilators[Math.floor(Math.random() * invigilators.length)][1];
            });
        });

        // Display results
        displayResults(timetable, studentSeating);
    }

    function displayResults(timetable, studentSeating) {
        const displayDiv = document.getElementById('timetableDisplay');
        displayDiv.innerHTML = '';
        
        Object.keys(timetable).forEach(dateTimeKey => {
            displayDiv.innerHTML += `<h3>${dateTimeKey}</h3>`;
            Object.keys(timetable[dateTimeKey]).forEach(classroomKey => {
                const classroomData = timetable[dateTimeKey][classroomKey];
                displayDiv.innerHTML += `<h4>${classroomKey} (${classroomData.students.length} students) - Invigilator: ${classroomData.invigilator}</h4>`;
                classroomData.students.forEach(student => {
                    displayDiv.innerHTML += `${student[1]} - ${student[2]}<br>`;
                });
            });
        });
    }

    // PDF Download
    document.getElementById('downloadPdf').addEventListener('click', () => {
        const doc = new jspdf.jsPDF();
        doc.text(document.getElementById('timetableDisplay').innerText, 10, 10);
        doc.save('timetable.pdf');
    });
});
