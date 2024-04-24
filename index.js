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

