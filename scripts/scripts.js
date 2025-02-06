
const tasks = document.getElementById("tasks")
const taskForm = document.forms.taskForm;
const wrapper = document.getElementById("wrapper")
const syncBtn = document.getElementById("syncBtn");
const themeSelector = document.getElementById("themeSelector");
const filter = document.getElementById("filters");
let taskList = {};
let appTheme = "light"
let categoryList = []
let id = 0;
let categoryMap = {};


const taskObjectBuilder = () => {
    const {taskText, category, taskNote} = taskForm.elements;

    let task = {
        "task" : taskText.value,
        "note" : taskNote.value,
        "id" : id++,
        "status" : "pending",
		"category" : category.value || ""
    }
    return task;
}

const addToCategoryMap = (task) => {
	let key = task['category'];	
	if(key in categoryMap) {
		categoryMap[key] += 1;
	}
	categoryMap[key] = 1
}

const decreaseCategoryMapKey = (task) => {
	let key = task['category'];
	if(key in categoryMap) {
		categoryMap[key] -= 1
	}
	if(categoryMap[key] == 0) {
		removeFilterBtn(categoryMap[key])
		delete categoryMap[key];
	}
}

const removeFilterBtn = (key) => {
	let category = categoryList.splice(categoryList.indexOf(key),1);
}

filter.addEventListener("click", (event) => {
	const target = event.target;
	if(target.tagName === "BUTTON") {
		let param = target.dataset.param
		let filteredTaskList = undefined;
		if(param === "completed" || param === "pending" || param === "archieve") {
			filteredTaskList = filterTasks("status", param);
		}
		else {
			filteredTaskList = filterTasks("category", param);
		}
		for (let task in filteredTaskList) {
			addTaskToUI(filteredTaskList[task]);
			addToCategoryMap(filteredTaskList[task]);
		}
	}
})

const filterTasks = (key, value) => {
    tasks.innerHTML = ""
	if(value === "allTasks") return taskList;
    return Object.fromEntries(
        Object.entries(taskList).filter(([taskId, task]) => task[key] === value)
    );
};

const taskStatusUpdate = (event) => {
    const target = event.target;
    const task = target.closest(".task")
    const taskText = task.querySelector(".taskTextContent > p")
    let taskFromTaskList = taskList[`task_${task.dataset.id}`]

    if(target.checked) {
        // taskText.style.textDecoration = "line-through";
        taskText.classList.add("strikeOut")
        taskFromTaskList.status = "completed"
        
    } else {
        // taskText.style.textDecoration = "none";
        taskText.classList.remove("strikeOut")
        taskFromTaskList.status = "pending"
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
	task.dataset.category = taskObject.category

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

const createFilterBtn = (category) => {
	const filterBtn = document.createElement("button")
	const filterDiv = document.createElement("div")
	filterDiv.classList.add("filter")
	filterBtn.dataset.param = category
	filterBtn.id = category
	filterBtn.innerText = category
	filterBtn.classList.add("filterButton")
	filterDiv.append(filterBtn)
	filter.append(filterDiv)
}

const checkCategoryExists = (task) => {
	let category = task.category
	console.log(category)
	if(!categoryList.includes(category)){
		categoryList.push(category)
		createFilterBtn(category)
	}
}

const addTask = (event) => {
    event.preventDefault();

    const task = taskObjectBuilder();
	checkCategoryExists(task);
    addTaskToUI(task)
    // Object.assign(taskList,{ 
    //    [`task_${task.id}`] : task 
    // })
    taskList[`task_${task.id}`] = task
	addToCategoryMap(task);
}

const removeFromUI = (target) => {
    const task = target.closest(".task")
    let keyToRemove = `task_${task.dataset.id}`
    
    task.remove()
	decreaseCategoryMapKey(taskList[keyToRemove])
    delete taskList[keyToRemove]
}

const deleteTask = (event) => {
    const target = event.target;
    if(!confirm("Are you sure about delete it?")) return

    const task = removeFromUI(target);

}

const appState = () => {
	return {
		categoryList,
		appTheme
	}
}

const saveToLocalStorage = (event) => {
    localStorage.setItem("taskList", JSON.stringify(taskList));
    localStorage.setItem("id", id)
	localStorage.setItem("appState", JSON.stringify(appState()))
    // event.preventDefault();
}

const getFromLocalStorage = (event) => {
    tasks.innerHTML = ""
    id = localStorage.getItem("id") || 1
    taskList = JSON.parse(localStorage.getItem("taskList")) || {};
	appTheme = JSON.parse(localStorage.getItem("appState"))["appTheme"] || "light"
    document.documentElement.setAttribute("data-theme", appTheme);
	themeSelector.value = appTheme
	categoryList = JSON.parse(localStorage.getItem("appState"))["categoryList"] || [] ;
    for (let task in taskList) {
        addTaskToUI(taskList[task])
		addToCategoryMap(taskList[task]);
    }
}

const editTask = (event) => {
    const target = event.target;
    const task = target.closest(".task")
    let keyToEdit = `task_${task.dataset.id}`

    const editTask = taskList[keyToEdit]
	const oldTask = editTask;
    const taskText = editTask['task']
    const taskNote = editTask['note']
	const category = editTask['category']

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

    const editCategory = document.createElement("input")
    editCategory.setAttribute("id", "editCategory")
    editCategory.setAttribute("value", category)
    editTaskContainer.append(editCategory)

    const editTaskNote = document.createElement("textarea")
    editTaskNote.setAttribute("id", "editTaskNote")
    editTaskNote.innerText = taskNote
    editTaskContainer.append(editTaskNote)
	
	const editActionButton = document.createElement("div");
	editActionButton.id = "editActionButton"
	editTaskContainer.append(editActionButton);

    const updateAction = document.createElement("button")
    updateAction.id = "updateAction"
    updateAction.innerText = "Update"
    editActionButton.append(updateAction);

    const cancelAction = document.createElement("button")
    cancelAction.id = "cancelAction"
    cancelAction.innerText = "Cancel"
    editActionButton.append(cancelAction); 

    updateAction.addEventListener("click", function() {

        const updatedTaskText = document.getElementById("editTaskText").value;
		const updateCategory = document.getElementById("editCategory").value;
        const updatedTaskNote = document.getElementById("editTaskNote").value;

        if(updatedTaskText === "") {
            alert("Task should not be empty")
            return;
        }
        
        if(updatedTaskText === taskText && updatedTaskNote === taskNote && updateCategory === category) {
            return;
        }
    
        editTask['task'] = updatedTaskText
        editTask['note'] = updatedTaskNote
		editTask['category'] = updateCategory

        updateOnUI(editTask, task)
		checkCategoryExists(editTask);
		addToCategoryMap(editTask);
		decreaseCategoryMapKey(oldTask);
    
        overlay.remove();
    })
    
    cancelAction.addEventListener("click", function() {
        overlay.remove();
    })
}
const syncData = () => {
	saveToLocalStorage()
	getFromLocalStorage()
}

const updateOnUI = (editTask, task) => {
    task.querySelector(".taskTextContent > p").innerText = editTask['task'];
    task.querySelector(".taskNoteContent > p").innerText = editTask['note'];

}

function applyTheme(event) {
	const theme = event.target.value;
	appTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
}

themeSelector.addEventListener("change", applyTheme);
taskForm.addEventListener("submit", addTask)
syncBtn.addEventListener("click", syncData)
window.addEventListener("beforeunload", saveToLocalStorage)
document.addEventListener("DOMContentLoaded", getFromLocalStorage)

