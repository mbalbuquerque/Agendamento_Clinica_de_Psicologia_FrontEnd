const API_URL = 'https://agendamento-clinica-de-psicologia-2.onrender.com/api/diary';

const entryForm = document.getElementById('entry-form');
const entriesList = document.getElementById('entries-list');
const messagePara = document.getElementById('message');

document.addEventListener('DOMContentLoaded', loadEntries);

// Função Principal de Carga
async function loadEntries() {
    try {
        const response = await fetch(API_URL);
        const entries = await response.json();
        renderList(entries);
    } catch (error) {
        entriesList.innerHTML = '<p class="text-center">Erro ao carregar dados.</p>';
    }
}

// Função de Renderização Unificada
function renderList(entries) {
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="text-center opacity-75">Nenhum agendamento encontrado.</p>';
        return;
    }

    entriesList.innerHTML = entries.map(entry => {
        const dataObj = new Date(entry.data);
        const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
        const diaMes = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const horario = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="appointment-item shadow-sm">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="badge-datetime">${diaSemana} - ${diaMes} às ${horario}</div>
                        <h5 class="mb-1">${entry.paciente}</h5>
                        <p class="mb-0 small">${entry.observacoes || 'Sem observações.'}</p>
                    </div>
                    <div class="btn-group ms-2">
                        <button onclick="prepareEdit('${entry._id}', '${entry.paciente}', '${entry.data}', '${entry.observacoes}')" class="btn btn-sm btn-light text-primary">Editar</button>
                        <button onclick="deleteEntry('${entry._id}')" class="btn btn-sm btn-outline-light">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Lógica de Filtro
document.getElementById('btn-filter').addEventListener('click', async () => {
    const start = document.getElementById('filter-start').value;
    const end = document.getElementById('filter-end').value;

    if (!start || !end) {
        alert("Selecione data inicial e final.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/filtro?inicio=${start}&fim=${end}`);
        const entries = await response.json();
        renderList(entries);
    } catch (error) {
        console.error("Erro no filtro:", error);
    }
});

// Salvar / Editar
entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('entry-id').value;
    const payload = {
        paciente: document.getElementById('paciente').value,
        data: document.getElementById('data').value,
        observacoes: document.getElementById('observacoes').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        resetForm();
        loadEntries();
    }
});

// Funções Auxiliares (Deletar, Editar, Reset)
window.deleteEntry = async (id) => {
    if (confirm("Excluir agendamento?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadEntries();
    }
};

window.prepareEdit = (id, paciente, data, obs) => {
    document.getElementById('entry-id').value = id;
    document.getElementById('paciente').value = paciente;
    document.getElementById('data').value = new Date(data).toISOString().slice(0, 16);
    document.getElementById('observacoes').value = obs;
    document.getElementById('form-title').innerText = "Editando Registro";
    document.getElementById('cancel-edit').classList.remove('d-none');
};

function resetForm() {
    entryForm.reset();
    document.getElementById('entry-id').value = "";
    document.getElementById('form-title').innerText = "Novo Registro";
    document.getElementById('cancel-edit').classList.add('d-none');
}

document.getElementById('reload-btn').addEventListener('click', loadEntries);
document.getElementById('cancel-edit').addEventListener('click', resetForm);