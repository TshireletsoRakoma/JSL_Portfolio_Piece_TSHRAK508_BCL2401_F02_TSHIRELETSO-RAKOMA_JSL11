// TASK: import helper functions from utils
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from './utils/taskFunctions.js';
// TASK: import initialData
import {initialData} from './initialData.js';
/*************************************************************************************************************************************************
 * 
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData();

// Getting the elements from the DOM
const elements = {

  // DOM elements for the Navigation Sidebar
    headerBoardName: document.getElementById("header-board-name"),
    sideBar: document.querySelector('.side-bar'),
    sideLogoDiv: document.getElementById('logo'),
    sideBarDiv: document.getElementById('side-bar-div'),
    boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
    themeSwitch: document.getElementById('switch'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
     // DOM elements for the Main Layout: Header with board title, add task button
  header: document.getElementById('header'),
  headerBoardName: document.getElementById('header-board-name'),
  dropdownBtn: document.getElementById('dropdownBtn'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),

  // DOM elements for the Main Layout: main content area for task columns
  columnDivs: document.querySelectorAll('.column-div'),
  tasksContainers: document.querySelectorAll('.tasks-container'),

   // DOM elements for New Task Modal: Form for adding a new task
   modalWindow: document.getElementById('new-task-modal-window'),
   titleInput: document.getElementById('title-input'),
   descInput: document.getElementById('desc-input'),
   selectStatus: document.getElementById('select-status'),
   createNewTaskBtn: document.getElementById('add-new-task-btn'),
   cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),

    // DOM elements for Edit Task Modal: Form for editing an existing task's details
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),

  // Filter Div 
  //filter div improves the user experience by providing visual focus on the modal window and preventing interactions with elements behind the modal
  filterDiv: document.getElementById('filterDiv'),
}

//is an essential part of managing the user's context in the application, allowing the code to track and display the currently active board and its associated tasks.
let activeBoard = ""

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0)  {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {const boardElement = document.createElement("button");
  boardElement.textContent = board;
  boardElement.classList.add("board-btn");
  boardElement.addEventListener('click', () => { 
    elements.headerBoardName.textContent = board;
    filterAndDisplayTasksByBoard(board);
    activeBoard = board //assigns active board
    localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
    styleActiveBoard(activeBoard)
  });
  boardsContainer.appendChild(boardElement);
  });

}


// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

                        const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styled the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

   // Clicking outside the modal to close it
   elements.filterDiv.addEventListener('click', () => {
    toggleModal(false); 
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

   // Show sidebar event listener
   elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
   elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
 
   // Show the button
   elements.showSideBarBtn.style.display = 'block';
 
   // Theme switch event listener
   elements.themeSwitch.addEventListener('change', toggleTheme);
 
   // Show Add New Task Modal event listener
   elements.createNewTaskBtn.addEventListener('click', () => {
     toggleModal(true);
     elements.filterDiv.style.display = 'block'; // Show the filter overlay
   });  

   elements.modalWindow.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask(event);
  });
  
}

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

// Style for the sideBar nav links, margin between the Nav Links Div's
elements.boardsNavLinksDiv.style.marginTop = "2.5rem";
elements.boardsNavLinksDiv.style.marginBottom = '17rem';

//*************************************************************************************************************************************************
 /* //COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

// Prevents the default behavior of the event, such as form submission or page refresh
function addTask(event) {
  event.preventDefault(); 

  const task_id = JSON.parse(localStorage.getItem('id'));// Gets the next available task ID from local storage and assigns it to the task object
    const titleInput = elements.titleInput.value;// Gets the value from the title input field and assigns it to the task object
    const descriptionInput = elements.descInput.value;// Gets the value from the description input field and assigns it to the task object
    const selectStatus = elements.selectStatus.value;// Gets the value from the status select field and assigns it to the task object

    //Assigning user input to the task object
// Creates a task object to store the details of a new task
const task = {
  // Assigns a unique identifier to the task (fetched from local storage)
id: task_id,
  // Sets the task title using the value entered in the title input field
title: titleInput,
  // Sets the task description using the value entered in the description input field
description: descriptionInput,
  // Sets the task status using the value selected in the status dropdown
status: selectStatus,
  // Sets the board for the task using the activeBoard variable, which should store the currently selected board
board: activeBoard,
};

const newTask = createNewTask(task);
if (newTask) {
  addTaskToUI(newTask);
  toggleModal(false);
  elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  event.target.reset();
  refreshTasksUI();
}
location.reload();
}

function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}

// Get the current mode from local storage or set to default (light)
const currentMode = localStorage.getItem('mode') || 'light';
let isLightMode = currentMode === 'light';

// Set the initial SVG source based on the current mode
let sideLogoDivSrc = isLightMode ? './assets/logo-dark.svg' : './assets/logo-light.svg';
elements.sideLogoDiv.src = sideLogoDivSrc;

const toggleTheme = (
) => {
  const isLightTheme = document.body.classList.contains('light-theme');
  document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', !isLightTheme ? 'enabled' : 'disabled');

  // Toggle the mode
isLightMode = !isLightMode;

// Set sideLogoDivSrc based on isLightMode
sideLogoDivSrc = isLightMode ? './assets/logo-dark.svg' : './assets/logo-light.svg';
  elements.sideLogoDiv.src = sideLogoDivSrc;

  // Store the selected mode in localStorage
localStorage.setItem('mode', isLightMode ? 'light' : 'dark');

  // Store the selected SVG source in localStorage
localStorage.setItem('sideLogoDiv', sideLogoDivSrc);
};

const openEditTaskModal = async (task) => {
  // Set task details in modal inputs
elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Add event listener to saveChangesBtn using element selector
document.querySelector('#save-task-changes-btn').addEventListener('click', () => {
    saveTaskChanges(task.id);
    refreshTasksUI();
  });

   // Add event listener to deleteTaskBtn using element selector
document.querySelector('#delete-task-btn').addEventListener('click', () => {
  deleteTask(task.id);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
});

toggleModal(true, elements.editTaskModal); // Show the edit task modal
refreshTasksUI();
};

const saveTaskChanges = async (taskId) => {
  // Get new user inputs from the elements
const { value: titleInput } = elements.editTaskTitleInput;
  const { value: descriptionInput } = elements.editTaskDescInput;
  const { value: selectStatus } = elements.editSelectStatus;

  // Create an object with the updated task details
const updatedTask = {
    title: titleInput,
    description: descriptionInput,
    status: selectStatus,
    board: activeBoard,
  };

  // Update task using a helper function
await patchTask(taskId, updatedTask);

// Close the modal and refresh the UI to reflect the changes
location.reload();
toggleModal(false, elements.editTaskModal);
refreshTasksUI();
};

const displayStoredTasks = (
) => {
  try {
    // Retrieving the tasks from localStorage
const storedTasks = localStorage.getItem('tasks');

    if (storedTasks) {
      // Parsing the JSON string to an array of tasks
const tasks = JSON.parse(storedTasks);

      // Logging the tasks to the console
console.log(tasks);
    } else {
      console.log('No tasks stored in localStorage.');
    }
  } catch (error) {
    console.error(`An error occurred when retrieving tasks: ${error}`);
  }
};

// Calling the function to display the stored tasks
displayStoredTasks();

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

// Defines an asynchronous initialization function that takes care of various setup tasks
const init = async (
) => {
  // Sets the logo path based on the value stored in the local storage, or uses a default value
const logoPath = localStorage.getItem('sideLogoDiv') || './assets/logo-light.svg';
  elements.sideLogoDiv.src = logoPath;

  // Sets up event listeners for user interactions with the application
setupEventListeners();

// Toggles the sidebar visibility based on the value stored in local storage
const showSidebar = localStorage.getItem('showSideBar') === 'true';
toggleSidebar(showSidebar);

 // Toggles the light theme based on the value stored in local storage
 const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
 elements.themeSwitch.checked = isLightTheme;
 document.body.classList.toggle('light-theme', isLightTheme);

 // Fetches and displays boards and tasks on the initial page load
await fetchAndDisplayBoardsAndTasks();
};

