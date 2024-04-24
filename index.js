// Import helper functions and initial data from 'utils/taskFunction.js'
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask 
} from './utils/taskFunctions.js';

import { initialData } from './initialData.js';

// Define DOM elements for easy access
const Image = document.getElementById('logo');
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  columnDivs: document.querySelectorAll('.column-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  saveChangesBtn: document.getElementById('save-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  sideBar: document.getElementById('side-bar-div'),
  taskTitleInput: document.getElementById('task-title'),
  taskDescriptionInput: document.getElementById('task-description'),
  taskStatusInput: document.getElementById('task-status'),
  taskBoardInput: document.getElementById('task-board'),
  editTaskTitleInput: document.getElementById('edit-task-title'),
  editTaskDescriptionInput: document.getElementById('edit-task-description'),
  editTaskStatusInput: document.getElementById('edit-task-status'),
  editTaskBoardInput: document.getElementById('edit-task-board'),
};

// Initialize data in local storage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
    localStorage.setItem('light-theme','unable')
    localStorage.setItem('logo',"assets/logo-light.svg");
    Image.src =localStorage.getItem('logo');

  } else {
    console.log('Data already exists in local storage.');
  }
}

initializeData();
let activeBoard = '';

// Function to fetch and display boards and tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = localStorage.getItem('activeBoard');
    activeBoard = localStorageBoard ? JSON.parse(localStorageBoard) : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Function to display boards and set up event listeners for each board button
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = '';

  boards.forEach(board => {
    const boardElement = document.createElement('button');
    boardElement.textContent = board;
    boardElement.classList.add('board-btn');

    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem('activeBoard', JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement);
  });
}

// Function to filter and display tasks by the active board
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute('data-status');

    column.innerHTML = `
      <div class="column-head-div">
        <span class="dot" id="${status}-dot"></span>
        <h4 class="columnHeader">${status.toUpperCase()}</h4>
      </div>
      <div class="tasks-container"></div>
    `;

    const tasksContainer = column.querySelector('.tasks-container');

    filteredTasks
      .filter(task => task.status === status)
      .forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-div');
        taskElement.textContent = task.title;
        taskElement.setAttribute('data-task-id', task.id);

        taskElement.addEventListener('click', () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

// Function to style the active board button
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Function to add a task to the UI
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
    tasksContainer.classList.add('tasks-container');
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  // taskElement.addEventListener('click', () => {
  //   openEditTaskModal(task);
  // });
  console.log('gffxtf')
  
  tasksContainer.appendChild(taskElement);
}

// Setup event listeners
function setupEventListeners() {
  elements.cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal);
  });

  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  elements.hideSideBarBtn.addEventListener('click', () => {
    toggleSidebar(false);
  });

  elements.showSideBarBtn.addEventListener('click', () => {
    toggleSidebar(true);
  });

  elements.themeSwitch.addEventListener('change', toggleTheme);

  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  elements.modalWindow.addEventListener('submit', addTask);
}

// Function to toggle the modal visibility
function toggleModal(show, modal = elements.modalWindow) {
  console.log(modal)
  modal.style.display = show ? 'block' : 'none';
}

// Function to add a task
function addTask(event) {
  event.preventDefault();

  // Retrieve task details from the form inputs
  const title = document.getElementById("title-input").value;
  const description = document.getElementById("desc-input").value;
  const status = document.getElementById("select-status").value;
  // const board = elements.getElementById("").value;

  // Create a new task object
  const task = {
    title: title,
    description: description,
    status: status,
    board: activeBoard
    // board,
  };

  // Create the new task using the utility function
  const newTask = createNewTask(task);
  // If the task is successfully created
  if (newTask) {
    // Add the new task to the UI
    addTaskToUI(newTask);
    
    // Close the modal window and hide the filter div
    toggleModal(false);
    elements.filterDiv.style.display = 'none';

    // Reset the form after adding the task
    event.target.reset();

    // Refresh the UI to reflect the changes
    refreshTasksUI();
  }
}

// Function to refresh the UI
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Function to toggle sidebar visibility
function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
  localStorage.setItem('showSideBar', show ? 'true' : 'false');
}

// Function to toggle theme
function toggleTheme() {
  //  const isLightTheme = elements.themeSwitch.checked;
  //  document.body.classList.toggle('light-theme', isLightTheme);
  //  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');

  if(localStorage.getItem('light-theme') =='enabled'){
    document.body.classList.toggle('light-theme',false);
    Image.src = localStorage.getItem('logo');
    localStorage.setItem('logo',"./assets/logo-light.svg")
    localStorage.setItem('light-theme','unabled');
  }
  else{
    document.body.classList.toggle('light-theme',true);
    localStorage.setItem('light-theme','enabled');
    Image.src = localStorage.getItem('logo');
    //localStorage.setItem('logo',"./assets/logo-light.svg")
    localStorage.setItem('logo',"./assets/logo-dark.svg")
  }
}

// Function to open edit task modal and set up event listeners for saving changes and deleting tasks
function openEditTaskModal(task) {
  // const editTaskModal = elements.editTaskModal;
  // editTaskModal.style.display = 'block';

  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;

  // Get button elements from the task modal
   const save = document.getElementById("save-task-changes-btn");
   const delete1 = document.getElementById("delete-task-btn");
   const cancel = document.getElementById("cancel-edit-btn");

   // call saveTask changes upon clicking save changes button
   save.addEventListener("click",() => {
     saveTaskChanges(task.id);
     toggleModal(false,elements.editTaskModal);
   });
   
   //Delete task using a helper function and close the task modal 
   delete1.addEventListener("click",()=>{
    deleteTask(task.id);
     toggleModal(false,elements.editTaskModal);
     refreshTasksUI();
   });

   cancel.addEventListener("click",()=>toggleModal(false,elements.editTaskModal));
   
    toggleModal(true,elements.editTaskModal);
    //toggleModal(false,elements.editTaskModal);

   }




  // document.editTaskBoardInput.value = task.board;

  // editTaskModal.setAttribute('data-task-id', task.id);

  // elements.saveChangesBtn.onclick = () => {
  //   saveTaskChanges(task);
  // };

  // elements.deleteTaskBtn.onclick = () => {
  //   removeTask(task);
  // };


// Function to save task changes
function saveTaskChanges(taskId) {
 //Get new user inputs
 const  title = document.getElementById('edit-task-title-input').value;
 const desc = document.getElementById("edit-task-desc-input").value;
 const status = document.getElementById("edit-select-status").value;


//create an object with the udated task detail

const editedTask ={
  title : title,
  description : desc,
  status : status,
  

}
patchTask(taskId,editedTask);
refreshTasksUI();

}



//    const updatedTask = {
//      title: editTaskTitle,
//      description: editTaskDescriptionInput,
//      status: status,
//      board: activeBoard
    
//   };

//   patchTask(updatedTask,taskId);

//   toggleModal(false, elements.editTaskModal);
//   refreshTasksUI();
// }

// Function to delete a task
function removeTask(task) {
  const taskId = elements.editTaskModal.getAttribute('data-task-id');
  utilsDeleteTask(taskId);

  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

// Initialize the app
// function init() {
//   fetchAndDisplayBoardsAndTasks();
//   setupEventListeners();

//   // Set the initial theme based on local storage
//   const isLightThemeEnabled = localStorage.getItem('light-theme') === 'enabled';
//   elements.themeSwitch.checked = isLightThemeEnabled;
//   document.body.classList.toggle('light-theme', isLightThemeEnabled);

//   // Toggle sidebar based on local storage
//   const showSideBar = localStorage.getItem('showSideBar') === 'true';
//   elements.sideBar.style.display = showSideBar ? 'block' : 'none';
// }
document.addEventListener('DOMContentLoaded', function() {
  init();
});


function init() {
  const darkLogoSrc = localStorage.getItem('logo');
  if (darkLogoSrc === "./assets/-dark.svg") {
    Image.src = "./assets/logo-light.svg"
  }
  //if(localStorage.getItem('logo')== ".assets/logo-dark.svg"){
    //Image.src = "./assets/logo-light.svg"
  }
  setupEventListeners();
  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar);
  //chek light theme from local storage and toggle it
  const isLightThemeEnabled = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme',isLightThemeEnabled);

  fetchAndDisplayBoardsAndTasks();

  //Rstore scroll position
const savedScrollPosition = localstorage.getItem('scrollPosition');
if (savedScrollPosition !== null) {
  window.scrollTo(0,parseInt(savedScrollPosition,10));
  console.log(`scroll position restored to: ${savedScrollPosition}`);

}
document.addEventListener('DOMContentLoaded',function() {
  init();

  //Add event listener to save scroll position when the page is about to unload
window.addEventListener('beforeunload',function() {
  localStorage.setItem('scrollPosition',window.scrollY);

});
});

function init() {
  //Initialize other event listeners 
  setupEventListeners();

  //Retrieves the saved sidebar state from local storage and set it
  const showSideBar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSideBar);
}

//check the stored theme state set it
const isLightThemeEnabled = localStorage.getItem('light-theme') === 'enabled';
//Toggle the light theme class on the documment if the theme is enabled
document.body.classList.toggle('light-theme',isLightThemeEnabled);

//set the initial sate of the theme switch based on the stored theme state
elements.themeSwitch.checked = isLightThemeEnabled;

//fetch and display boards and tasks
fetchAndDisplayBoardsAndTasks();

//Restore scroll position 
const savedScrollPosition = local.getItem('scrollPosition');
if (savedScrollPosition !== null) {
  window.scrollTo(0,parseInt(savedScrollPosition,10));
  console.log(`scroll position restored to: ${savedScrollPosition}`);
  }

}

//set up event liste



