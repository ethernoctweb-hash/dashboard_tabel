document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "admin_dashboard_data_v1";
    const COLUMNS_KEY = "admin_dashboard_columns_v1";
    const DEFAULT_PAGE_SIZE = 10;

    const defaultColumns = {
        col1: "Account",
        col2: "Type",
        col3: "ID",
        col4: "Jumlah",
        col5: "Status"
    };

    function loadColumns() {
        const saved = localStorage.getItem(COLUMNS_KEY);
        if (!saved) return defaultColumns;
        try {
            return { ...defaultColumns, ...JSON.parse(saved) };
        } catch {
            return defaultColumns;
        }
    }

    function saveColumns(cols) {
        localStorage.setItem(COLUMNS_KEY, JSON.stringify(cols));
    }

    const initialData = [
        { id: "1", accountType: "Jackpot Sensasional", type: "VIP Prioritas", selectedId: "823-1233-2783", claimAmount: 5500000, status: "Menunggu" },
        { id: "2", accountType: "Free Scatter", type: "VIP Prioritas", selectedId: "813-****-1520", claimAmount: 3200000, status: "Success" },
        { id: "3", accountType: "GET 350%", type: "VIP Prioritas", selectedId: "882-****-5523", claimAmount: 4600000, status: "Success" },
        { id: "4", accountType: "Premium User", type: "VIP Prioritas", selectedId: "882-****-8900", claimAmount: 3500000, status: "Success" },
        { id: "5", accountType: "Jackpot Sensasional", type: "VIP Prioritas", selectedId: "853-****-2022", claimAmount: 5200000, status: "Success" },

    ];

    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        }
        try {
            return JSON.parse(saved);
        } catch {
            return initialData;
        }
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    const state = {
        data: loadData(),
        columns: loadColumns(),
        search: "",
        status: "all",
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        selectedId: null,
        editingId: null,
        deletingId: null
    };

    const elements = {
        searchInput: document.getElementById("searchInput"),
        statusFilter: document.getElementById("statusFilter"),
        addDataBtn: document.getElementById("addDataBtn"),
        tableBody: document.getElementById("dataTableBody"),
        totalData: document.getElementById("totalData"),
        resultInfo: document.getElementById("resultInfo"),
        pageSize: document.getElementById("pageSize"),
        pagination: document.getElementById("pagination"),
        
        externalActionBar: document.getElementById("externalActionBar"),
        barEditBtn: document.getElementById("barEditBtn"),
        barDeleteBtn: document.getElementById("barDeleteBtn"),

        // Header Table Elements
        thCol1: document.getElementById("thCol1"),
        thCol2: document.getElementById("thCol2"),
        thCol3: document.getElementById("thCol3"),
        thCol4: document.getElementById("thCol4"),
        thCol5: document.getElementById("thCol5"),

        // Form Modal Kolom
        openColumnsModalBtn: document.getElementById("openColumnsModalBtn"),
        columnsModal: document.getElementById("columnsModal"),
        closeColumnsModal: document.getElementById("closeColumnsModal"),
        cancelColumnsBtn: document.getElementById("cancelColumnsBtn"),
        columnsForm: document.getElementById("columnsForm"),
        col1Input: document.getElementById("col1Input"),
        col2Input: document.getElementById("col2Input"),
        col3Input: document.getElementById("col3Input"),
        col4Input: document.getElementById("col4Input"),
        col5Input: document.getElementById("col5Input"),

        // Form Input Labels inside Add/Edit modal
        labelAccType: document.getElementById("labelAccType"),
        labelType: document.getElementById("labelType"),
        labelSelId: document.getElementById("labelSelId"),
        labelClaimAmt: document.getElementById("labelClaimAmt"),

        formModal: document.getElementById("formModal"),
        formModalTitle: document.getElementById("formModalTitle"),
        dataForm: document.getElementById("dataForm"),
        closeFormModal: document.getElementById("closeFormModal"),
        cancelFormBtn: document.getElementById("cancelFormBtn"),
        accountTypeInput: document.getElementById("accountTypeInput"),
        typeInput: document.getElementById("typeInput"),
        selectedIdInput: document.getElementById("selectedIdInput"),
        claimAmountInput: document.getElementById("claimAmountInput"),
        statusInput: document.getElementById("statusInput"),

        deleteModal: document.getElementById("deleteModal"),
        closeDeleteModal: document.getElementById("closeDeleteModal"),
        cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
        confirmDeleteBtn: document.getElementById("confirmDeleteBtn")
    };

    function init() {
        bindEvents();
        applyColumnTitles();
        render();
    }

    function applyColumnTitles() {
        elements.thCol1.textContent = state.columns.col1;
        elements.thCol2.textContent = state.columns.col2;
        elements.thCol3.textContent = state.columns.col3;
        elements.thCol4.textContent = state.columns.col4;
        elements.thCol5.textContent = state.columns.col5;

        // Sesuaikan juga label input form modal tambah/edit agar sinkron
        if (elements.labelAccType) elements.labelAccType.textContent = state.columns.col1;
        if (elements.labelType) elements.labelType.textContent = state.columns.col2;
        if (elements.labelSelId) elements.labelSelId.textContent = state.columns.col3;
        if (elements.labelClaimAmt) elements.labelClaimAmt.textContent = state.columns.col4;
    }

    function bindEvents() {
        elements.searchInput.addEventListener("input", (e) => {
            state.search = e.target.value;
            state.page = 1;
            render();
        });

        elements.statusFilter.addEventListener("change", (e) => {
            state.status = e.target.value;
            state.page = 1;
            render();
        });

        elements.pageSize.addEventListener("change", (e) => {
            state.pageSize = parseInt(e.target.value, 10);
            state.page = 1;
            render();
        });

        // Event Modal Pengaturan Kolom
        elements.openColumnsModalBtn.addEventListener("click", () => {
            elements.col1Input.value = state.columns.col1;
            elements.col2Input.value = state.columns.col2;
            elements.col3Input.value = state.columns.col3;
            elements.col4Input.value = state.columns.col4;
            elements.col5Input.value = state.columns.col5;
            elements.columnsModal.hidden = false;
        });

        elements.closeColumnsModal.addEventListener("click", () => { elements.columnsModal.hidden = true; });
        elements.cancelColumnsBtn.addEventListener("click", () => { elements.columnsModal.hidden = true; });
        elements.columnsModal.addEventListener("click", (e) => {
            if (e.target === elements.columnsModal) elements.columnsModal.hidden = true;
        });

        elements.columnsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            state.columns = {
                col1: elements.col1Input.value.trim(),
                col2: elements.col2Input.value.trim(),
                col3: elements.col3Input.value.trim(),
                col4: elements.col4Input.value.trim(),
                col5: elements.col5Input.value.trim()
            };
            saveColumns(state.columns);
            applyColumnTitles();
            elements.columnsModal.hidden = true;
        });

        elements.addDataBtn.addEventListener("click", () => openAddModal());
        elements.closeFormModal.addEventListener("click", () => closeFormModal());
        elements.cancelFormBtn.addEventListener("click", () => closeFormModal());

        elements.formModal.addEventListener("click", (e) => {
            if (e.target === elements.formModal) closeFormModal();
        });

        elements.dataForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleFormSubmit();
        });

        elements.closeDeleteModal.addEventListener("click", () => closeDeleteModal());
        elements.cancelDeleteBtn.addEventListener("click", () => closeDeleteModal());
        elements.deleteModal.addEventListener("click", (e) => {
            if (e.target === elements.deleteModal) closeDeleteModal();
        });
        elements.confirmDeleteBtn.addEventListener("click", () => handleDeleteConfirm());

        // Klik Baris Tabel untuk Memilih Data
        elements.tableBody.addEventListener("click", (e) => {
            const row = e.target.closest(".data-row");
            if (!row) return;

            const id = row.dataset.id;
            if (state.selectedId === id) {
                state.selectedId = null;
            } else {
                state.selectedId = id;
            }
            render();
        });

        // Tombol Edit & Hapus di Action Bar Luar
        elements.barEditBtn.addEventListener("click", () => {
            if (state.selectedId) openEditModal(state.selectedId);
        });

        elements.barDeleteBtn.addEventListener("click", () => {
            if (state.selectedId) openDeleteModal(state.selectedId);
        });
    }

    function getFilteredData() {
        return state.data.filter(item => {
            const query = state.search.toLowerCase();
            const matchesSearch = 
                item.accountType.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query) ||
                item.selectedId.toLowerCase().includes(query) ||
                item.claimAmount.toString().includes(query);

            const matchesStatus = state.status === "all" || item.status === state.status;

            return matchesSearch && matchesStatus;
        });
    }

    function render() {
        const filtered = getFilteredData();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / state.pageSize) || 1;

        if (state.page > totalPages) state.page = totalPages;
        if (state.page < 1) state.page = 1;

        const startIndex = (state.page - 1) * state.pageSize;
        const endIndex = startIndex + state.pageSize;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        renderTable(paginatedItems);
        renderPagination(totalPages);

        elements.totalData.textContent = state.data.length;
        if (totalItems === 0) {
            elements.resultInfo.textContent = "Tidak ada data";
        } else {
            elements.resultInfo.textContent = `Menampilkan ${startIndex + 1}-${Math.min(endIndex, totalItems)} dari${totalItems} data`;
        }

        updateActionBarState();
    }

    function renderTable(items) {
        if (items.length === 0) {
            elements.tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5">Tidak ada data ditemukan</td>
                </tr>
            `;
            return;
        }

        elements.tableBody.innerHTML = items.map(item => `
            <tr class="data-row ${item.id === state.selectedId ? 'selected' : ''}" data-id="${escapeHtml(item.id)}">
                <td>${escapeHtml(item.accountType)}</td>
                <td>${escapeHtml(item.type)}</td>
                <td>${escapeHtml(item.selectedId)}</td>
                <td class="claim-number">${formatNumber(item.claimAmount)}</td>
                <td>${renderStatusBadge(item.status)}</td>
            </tr>
        `).join("");
    }

    function updateActionBarState() {
        if (!state.selectedId) {
            elements.externalActionBar.hidden = true;
            return;
        }

        const exists = state.data.some(item => item.id === state.selectedId);
        if (!exists) {
            state.selectedId = null;
            elements.externalActionBar.hidden = true;
            return;
        }

        elements.externalActionBar.hidden = false;
    }

    function renderStatusBadge(status) {
        if (status === "Success") {
            return `<span class="status-badge success">Success</span>`;
        }
        return `<span class="status-badge waiting">Menunggu</span>`;
    }

    function formatNumber(num) {
        return new Intl.NumberFormat("id-ID").format(num);
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            elements.pagination.innerHTML = "";
            return;
        }

        let html = ``;
        html += `<button class="page-btn" ${state.page === 1 ? "disabled" : ""} onclick="changePage(${state.page - 1})">‹</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
                html += `<button class="page-btn ${i === state.page ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
            } else if (i === state.page - 2 || i === state.page + 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }

        html += `<button class="page-btn" ${state.page === totalPages ? "disabled" : ""} onclick="changePage(${state.page + 1})">›</button>`;
        elements.pagination.innerHTML = html;
    }

    window.changePage = function(page) {
        state.page = page;
        render();
    };

    function openAddModal() {
        state.editingId = null;
        elements.formModalTitle.textContent = "Tambah Data";
        elements.dataForm.reset();
        elements.formModal.hidden = false;
    }

    function openEditModal(id) {
        const item = state.data.find(d => d.id === id);
        if (!item) return;

        state.editingId = id;
        elements.formModalTitle.textContent = "Edit Data";
        elements.accountTypeInput.value = item.accountType;
        elements.typeInput.value = item.type;
        elements.selectedIdInput.value = item.selectedId;
        elements.claimAmountInput.value = item.claimAmount;
        elements.statusInput.value = item.status;
        elements.formModal.hidden = false;
    }

    function closeFormModal() {
        elements.formModal.hidden = true;
        elements.dataForm.reset();
        state.editingId = null;
    }

    function handleFormSubmit() {
        const accountType = elements.accountTypeInput.value.trim();
        const type = elements.typeInput.value.trim();
        const selectedId = elements.selectedIdInput.value.trim();
        const claimAmount = parseInt(elements.claimAmountInput.value, 10);
        const status = elements.statusInput.value;

        if (!accountType || !type || !selectedId || isNaN(claimAmount)) return;

        if (state.editingId) {
            state.data = state.data.map(item => {
                if (item.id === state.editingId) {
                    return { ...item, accountType, type, selectedId, claimAmount, status };
                }
                return item;
            });
        } else {
            const newItem = {
                id: Date.now().toString(),
                accountType,
                type,
                selectedId,
                claimAmount,
                status
            };
            state.data.unshift(newItem);
        }

        saveData(state.data);
        closeFormModal();
        state.selectedId = null;
        render();
    }

    function openDeleteModal(id) {
        state.deletingId = id;
        elements.deleteModal.hidden = false;
    }

    function closeDeleteModal() {
        elements.deleteModal.hidden = true;
        state.deletingId = null;
    }

    function handleDeleteConfirm() {
        if (!state.deletingId) return;

        state.data = state.data.filter(item => item.id !== state.deletingId);
        saveData(state.data);
        closeDeleteModal();
        state.selectedId = null;
        render();
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    init();
});