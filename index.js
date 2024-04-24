// TASK: import helper functions from utils
import {getTasks, createNewTask, patchTask, putTask, deleteTask} from './utils/taskFunctions.js';
// TASK: import initialData
import {initialData} from './initialData.js';

/*************************************************************************************************************************************************
 * 
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage