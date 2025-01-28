
const tasks = document.getElementById("tasks")
const taskForm = document.forms.taskForm;
const wrapper = document.getElementById("wrapper")
let taskList = {};
let id = 0;
console.log(taskList)


const taskObjectBuilder = () => {
    const {taskText, taskNote} = taskForm.elements;

    let task = {
        "task" : taskText.value,
        "note" : taskNote.value,
        "id" : id++,
        "status" : "pending"
    }
    return task;
}
const taskStatusUpdate = (event) => {
    const target = event.target;
    const task = target.closest(".task")
    const taskText = task.querySelector(".taskTextContent > p")
    let taskFromTaskList = taskList[`task_${task.dataset.id}`]

    if(target.checked) {
        // taskText.style.textDecoration = "line-through";
        taskText.classList.add("strikeOut")
        taskFromTaskList.status = "completed"
        console.log("completed");
        
    } else {
        // taskText.style.textDecoration = "none";
        taskText.classList.remove("strikeOut")
        taskFromTaskList.status = "pending"
        console.log("pending");
    }

}

const addTaskToUI = (taskObject) => {
    if(!(taskObject instanceof Object) || !(typeof(taskObject) === "object")) {
        return false;
    }

    const task = document.createElement("div")
    task.classList.add("task");
    task.dataset.id = taskObject.id
    task.dataset.status = taskObject.status

    const main = document.createElement("div")
    main.classList.add("main");
    const slide = document.createElement("div")
    slide.classList.add("slide");
    task.append(main)
    task.append(slide)


    const tick = document.createElement("div")
    tick.classList.add("tick")
    const checkbox = document.createElement("input")
    checkbox.setAttribute("type","checkbox")
    tick.append(checkbox)
    tick.addEventListener("change", taskStatusUpdate);
    if(taskObject.status === "completed") {
        checkbox.checked = true;
    }

    const taskTextContent = document.createElement("div")
    taskTextContent.classList.add("taskTextContent")
    const p = document.createElement("p")
    p.innerText = taskObject.task
    taskTextContent.append(p)
    if(taskObject.status === "completed") {
        taskTextContent.classList.add("strikeOut")
    }

    const actions = document.createElement("div")
    actions.classList.add("actions")

    const expandBtn = document.createElement("button")
    expandBtn.classList.add("expandButton")
    expandBtn.addEventListener("click", expandNote)
    const expandIcon = document.createElement("i")
    expandIcon.classList.add("fa", "fa-chevron-down", "icon")
    expandBtn.append(expandIcon)

    const editBtn = document.createElement("button")
    editBtn.classList.add("editButton")
    editBtn.addEventListener("click", editTask)
    const editIcon = document.createElement("i")
    editIcon.classList.add("fa", "fa-pencil-square-o", "icon")
    editBtn.append(editIcon)

    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("deleteButton")
    deleteBtn.addEventListener("click", deleteTask)
    const deleteIcon = document.createElement("i")
    deleteIcon.classList.add("fa", "fa-trash", "icon")
    deleteBtn.append(deleteIcon)

    actions.append(expandBtn)
    actions.append(editBtn)
    actions.append(deleteBtn)

    const taskNoteContent = document.createElement("div")
    taskNoteContent.classList.add("taskNoteContent")
    const p1 = document.createElement("p")
    p1.innerText = taskObject.note
    taskNoteContent.append(p1)
    taskNoteContent.hidden = true;

    main.append(tick)
    main.append(taskTextContent)
    main.append(actions)
    slide.append(taskNoteContent)
    
    tasks.append(task)
    taskForm.reset()
}

const expandNote = (event) => {
    const target = event.target;
    const task = target.closest(".task");
    const slide = task.querySelector(".taskNoteContent");
    slide.hidden = !slide.hidden;
    target.classList.toggle("fa-chevron-down")
    target.classList.toggle("fa-chevron-up")
}

const addTask = (event) => {
    event.preventDefault();

    const task = taskObjectBuilder();
    addTaskToUI(task)
	console.log(task)
    console.log(taskList)
    // Object.assign(taskList,{ 
    //    [`task_${task.id}`] : task 
    // })
    taskList[`task_${task.id}`] = task
    console.log(taskList);    
}

const removeFromUI = (target) => {
    const task = target.closest(".task")
    let keyToRemove = `task_${task.dataset.id}`
    
    task.remove()
    delete taskList[keyToRemove]
    console.log(taskList);
}

const deleteTask = (event) => {
    const target = event.target;
    if(!confirm("Are you sure about delete it?")) return

    const task = removeFromUI(target);

}

const editTask = (event) => {
    const target = event.target;
    const task = target.closest(".task")
    let keyToEdit = `task_${task.dataset.id}`

    const editTask = taskList[keyToEdit]
    console.log(editTask)
    const taskText = editTask['task']
    const taskNote = editTask['note']

    const overlay = document.createElement("div");
    overlay.classList.add("overlay", "spread");
    wrapper.append(overlay);
    
    const editTaskContainer = document.createElement("div")
    editTaskContainer.classList.add("editTaskContainer");
    overlay.append(editTaskContainer);

    const editTaskText = document.createElement("input")
    editTaskText.setAttribute("id", "editTaskText")
    editTaskText.setAttribute("value", taskText)
    editTaskContainer.append(editTaskText)

    const editTaskNote = document.createElement("textarea")
    editTaskNote.setAttribute("id", "editTaskNote")
    editTaskNote.innerText = taskNote
    editTaskContainer.append(editTaskNote)

    const updateAction = document.createElement("button")
    updateAction.id = "updateAction"
    updateAction.innerText = "Update"
    editTaskContainer.append(updateAction);

    const cancelAction = document.createElement("button")
    cancelAction.id = "cancelAction"
    cancelAction.innerText = "Cancel"
    editTaskContainer.append(cancelAction); 

    updateAction.addEventListener("click", function() {

        const updatedTaskText = document.getElementById("editTaskText").value;
        const updatedTaskNote = document.getElementById("editTaskNote").value;

        if(updatedTaskText === "") {
            alert("Task should not be empty")
            return;
        }
        
        if(updatedTaskText === taskText && updatedTaskNote === taskNote) {
            return;
        }
    
        editTask['task'] = updatedTaskText
        editTask['note'] = updatedTaskNote

        updateOnUI(editTask, task)
    
        overlay.remove();
    })
    
    cancelAction.addEventListener("click", function() {
        overlay.remove();
    })
}

const updateOnUI = (editTask, task) => {
    task.querySelector(".taskTextContent > p").innerText = editTask['task'];
    task.querySelector(".taskNoteContent > p").innerText = editTask['note'];

}

taskForm.addEventListener("submit", addTask)

window.addEventListener("beforeunload", (event) => {
    localStorage.setItem("taskList", JSON.stringify(taskList));
    localStorage.setItem("id", id)
    // event.preventDefault();
});

document.addEventListener("DOMContentLoaded", (event) => {
    tasks.innerHTML = ""
    id = localStorage.getItem("id") || 1
    taskList = JSON.parse(localStorage.getItem("taskList")) || {};
    for (let task in taskList) {
        addTaskToUI(taskList[task])
    }
})

