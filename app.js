// ================== LOAD TASKS ==================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ================== RENDER TASKS ==================
function renderTasks(list = tasks){
    const container = document.getElementById("task-list");
    container.innerHTML = "";

    if(list.length === 0){
        container.innerHTML = "<p class='no-tasks'>No tasks yet.</p>";
        updateStats();
        renderWidgets();
        return;
    }

    list.forEach((t, i)=>{
        container.innerHTML += `
        <div class="task-card ${t.completed ? 'completed' : ''}">
            <div class="left">
                <span class="dot ${t.priority.toLowerCase()}"></span>
                <div>
                    <h4 style="${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</h4>
                    <p>${t.desc}</p>
                    <div class="cat-due">
                        <small><span class="catDue">Due:</span> ${t.due}</small><br>
                        <small><span class="catDue">Category:</span> ${t.category}</small>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button class="icon-btn done" onclick="toggleComplete(${i})" title="${t.completed ? 'Undo' : 'Complete'}">
                    <i class='bx ${t.completed ? 'bx-check-double' : 'bx-check'}'></i>
                </button>

                <button class="icon-btn edit" onclick="editTask(${i})" title="Edit">
                    <i class='bx bx-edit-alt'></i>
                </button>

                <button class="icon-btn delete" onclick="deleteTask(${i})" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        </div>`;
    });

    updateStats();
    renderWidgets();
}

// ================== STATS (TOP 4 BOXES) ==================
function updateStats(){
    const now = new Date();
    now.setHours(0,0,0,0);

    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;

    tasks.forEach(t=>{
        const due = new Date(t.due);
        due.setHours(0,0,0,0);

        if(t.completed){
            completed++;
            return;
        }

        if(due < now) overdue++;

        const diffDays = (due - now) / (1000*60*60*24);
        if(diffDays >= 0 && diffDays <= 3) dueSoon++;
    });

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("dueSoonTasks").textContent = dueSoon;
}

// ================== WIDGETS ==================
function renderWidgets(){
    const box = document.getElementById("dashboard-widgets");

    if(tasks.length <= 2){
        box.innerHTML = "";
        return;
    }

    let low=0, med=0, high=0;
    tasks.forEach(t=>{
        if(t.priority==="Low") low++;
        if(t.priority==="Medium") med++;
        if(t.priority==="High") high++;
    });

    box.innerHTML = `
        <div class="card">
            <h3>Priority Distribution</h3>
            <p>Low: ${low}</p>
            <p>Medium: ${med}</p>
            <p>High: ${high}</p>
        </div>

        <div class="card">
            <h3>Task Categories</h3>
            ${getCategoryCounts()}
        </div>

        <div class="card">
            <h3>Upcoming Deadlines</h3>
            ${getUpcoming()}
        </div>
    `;
}

// ================== CATEGORY COUNTS ==================
function getCategoryCounts(){
    const map = {};
    tasks.forEach(t=>{
        map[t.category] = (map[t.category] || 0) + 1;
    });

    return Object.entries(map)
        .map(([k,v])=>`<p>${k}: ${v}</p>`)
        .join("");
}

// ================== UPCOMING 4 TASKS ==================
function getUpcoming(){
    const sorted = [...tasks]
        .filter(t=>!t.completed)
        .sort((a,b)=> new Date(a.due)-new Date(b.due))
        .slice(0,4);

    if(sorted.length === 0) return "<p>No upcoming tasks</p>";

    return sorted
        .map(t=>`<p>${t.title} - ${t.due}</p>`)
        .join("");
}

// ================== SAVE TASK ==================
function saveTask(){
    const t = {
        title: title.value,
        desc: desc.value,
        due: due.value,
        category: category.value,
        priority: priority.value,
        completed: false
    };

    tasks.push(t);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    closeForm();
    renderTasks();
}

// ================== DELETE ==================
function deleteTask(i){
    tasks.splice(i,1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

// ================== TOGGLE COMPLETE ==================
function toggleComplete(i){
    tasks[i].completed = !tasks[i].completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

// ================== EDIT TASK ==================
let editIndex = null;

function editTask(i){
    const t = tasks[i];
    title.value = t.title;
    desc.value = t.desc;
    due.value = t.due;
    category.value = t.category;
    priority.value = t.priority;

    editIndex = i;
    openForm();
}

function saveTask(){
    const t = {
        title: title.value,
        desc: desc.value,
        due: due.value,
        category: category.value,
        priority: priority.value,
        completed: false
    };

    if(editIndex !== null){
        tasks[editIndex] = {...tasks[editIndex], ...t};
        editIndex = null;
    } else {
        tasks.push(t);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    closeForm();
    renderTasks();
}

// ================== SEARCH ==================
function searchTask(){
    const val = document.getElementById("search").value.toLowerCase();
    const stats = document.getElementById("stats");

    // If search is empty → restore everything
    if(!val){
        stats.style.display = "grid";
        renderTasks();
        return;
    }

    // Hide stats while searching
    stats.style.display = "none";

    const filtered = tasks.filter(t =>
        t.title.toLowerCase().includes(val)
    );

    const list = document.getElementById("task-list");
    list.innerHTML = "";

    if(filtered.length === 0){
        list.innerHTML = "<p>No task exist with that title</p>";
        return;
    }

    filtered.forEach((t, i)=>{
        list.innerHTML += `
        <div class="task-card">
            <div class="left">
                <span class="dot ${t.priority.toLowerCase()}"></span>
                <div>
                    <h4>${t.title}</h4>
                    <p>${t.desc}</p>
                    <small>Due: ${t.due}</small><br>
                    <small>Category: ${t.category}</small>
                </div>
            </div>

            <div class="actions">
                <button onclick="editTask(${i})">Edit</button>
                <button onclick="toggleComplete(${i})">
                    ${t.completed ? "Completed" : "Complete"}
                </button>
                <button onclick="deleteTask(${i})">Delete</button>
            </div>
        </div>`;
    });
}


// ================== MODAL ==================
function openForm(){
    document.getElementById("taskModal").style.display="flex";
}
function closeForm(){
    document.getElementById("taskModal").style.display="none";
}

// ================== INITIAL LOAD ==================
renderTasks();
updateStats();
