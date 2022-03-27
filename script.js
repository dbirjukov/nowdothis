const initialState = { mode: 'plan', tasks: [] };
function getState(action, state = initialState) {
  let tasks;
  switch (action.type) {
    case 'READY':
      tasks = action.tasks
        .split('\n')
        .filter((val) => val.length > 0)
        .map((task, id) => ({ id, name: task, done: false }));
      return {
        mode: 'execute',
        tasks,
      };
    case 'TASK_DONE':
      tasks = state.tasks.slice();
      const taskDone = tasks.find((task) => task.id === action.taskId);
      taskDone.done = true;
      return { ...state, tasks };
    case 'START_AGAIN':
      return initialState;
    default:
      return state;
  }
}

function el(type, props = {}, children) {
  const elem = document.createElement(type);
  Object.keys(props).forEach((key) => {
    elem[key] = props[key];
  });
  if (children instanceof Array) {
    for (const child of children) {
      elem.appendChild(child);
    }
  } else if (typeof children === 'object') {
    elem.appendChild(children);
  }
  return elem;
}

function empty(element) {
  let parent = document.body;
  if (typeof element === 'string') {
    parent = document.getElementById(elementId);
  } else if (typeof element === 'object') {
    parent = element;
  }
  let child;
  while ((child = parent.firstChild)) parent.removeChild(child);
}

function renderPlanPage(state, signal) {
  const p = el('p', { textContent: 'Now Do This' });
  const tasks = el('textarea', { placeholder: 'add your tasks here...' });
  const btn = el('button', {
    textContent: 'Ready',
    onclick: () => signal({ type: 'READY', tasks: tasks.value }, state),
  });
  return [p, tasks, btn];
}

function renderExecutePage(state, signal) {
  const currentTask = state.tasks.find((task) => task.done === false);
  console.log(currentTask);
  const p = el('p', {
    textContent: currentTask
      ? currentTask.name
      : 'No more tasks! Congratulations!',
    className: 'current-task',
  });
  const nextBtn = el('button', {
    textContent: currentTask ? 'Done' : 'Start again',
  });
  nextBtn.onclick = currentTask
    ? () => signal({ type: 'TASK_DONE', taskId: currentTask.id }, state)
    : () => signal({ type: 'START_AGAIN' }, state);
  return [p, nextBtn];
}

function render(state, signal) {
  const container = document.getElementById('app');
  empty(container);
  let contents;
  if (state.mode === 'plan') {
    contents = renderPlanPage(state, signal);
  } else if (state.mode === 'execute') {
    contents = renderExecutePage(state, signal);
  } else {
    throw new Error('unknown mode: ' + state.mode);
  }
  contents.forEach((elt) => container.appendChild(elt));
}

function start() {
  function signal(action, state) {
    const newState = getState(action, state);
    console.log(newState);
    render(newState, signal);
  }
  render(initialState, signal);
}

start();
