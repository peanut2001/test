// 后台管理系统主要功能
class AdminSystem {
    constructor() {
        this.currentPage = 'dashboard';
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.initNavigation();
        this.initSidebar();
        this.initDataCollection();
        this.initDataTable();
        this.initResponsive();
    }

    // 导航功能
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const pageTitle = document.getElementById('pageTitle');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.switchPage(page);

                // 更新导航状态
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // 更新页面标题
                const titles = {
                    'dashboard': '仪表盘',
                    'data-collection': '数据采集',
                    'data-management': '数据管理',
                    'image-analysis': '图像分析',
                    'diagnosis-review': '诊断审核',
                    'model-scoring': '模型评分',
                    'reports': '统计报告',
                    'settings': '系统设置'
                };
                pageTitle.textContent = titles[page] || '仪表盘';
            });
        });
    }

    // 页面切换
    switchPage(page) {
        // 隐藏所有页面
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => p.classList.remove('active'));

        // 显示目标页面
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // 如果切换到模型评分页面，加载评分系统
            if (page === 'model-scoring') {
                this.loadModelScoringSystem();
            }
        }
    }

    // 侧边栏功能
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mainContent = document.querySelector('.main-content');

        // 桌面端侧边栏切换
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.sidebarCollapsed = !this.sidebarCollapsed;
                if (this.sidebarCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('expanded');
                } else {
                    sidebar.classList.remove('collapsed');
                    mainContent.classList.remove('expanded');
                }
            });
        }

        // 移动端菜单切换
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }

        // 点击外部关闭移动端菜单
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !sidebar.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }

    // 数据采集功能
    initDataCollection() {
        // 获取数据采集相关元素
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.fileName = document.getElementById('fileName');
        this.removeImage = document.getElementById('removeImage');

        this.previewBtn = document.getElementById('previewBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.medicalDataForm = document.getElementById('medicalDataForm');

        this.previewModal = document.getElementById('previewModal');
        this.closeModal = document.getElementById('closeModal');
        this.previewContent = document.getElementById('previewContent');

        // 只有在数据采集页面才初始化这些功能
        if (this.uploadArea) {
            this.initFileUpload();
            this.initFormValidation();
            this.initTagSystem();
        }
    }

    // 初始化词条系统
    initTagSystem() {
        // 初始化各个词条区域
        this.initTagArea('features', 'addFeatureBtn', 'featuresContainer', 'featureInputGroup');
        this.initTagArea('thinking', 'addThinkingBtn', 'thinkingContainer', 'thinkingInputGroup');
        this.initTagArea('basis', 'addBasisBtn', 'basisContainer', 'basisInputGroup');

        // 初始化预设标签
        this.initPresetTags();
    }

    // 初始化词条区域
    initTagArea(category, addBtnId, containerId, inputGroupId) {
        const addBtn = document.getElementById(addBtnId);
        const container = document.getElementById(containerId);
        const inputGroup = document.getElementById(inputGroupId);

        if (!addBtn || !container || !inputGroup) return;

        // 添加按钮事件
        addBtn.addEventListener('click', () => {
            this.showTagInput(inputGroup);
        });

        // 输入框事件
        const input = inputGroup.querySelector('.tag-input');
        const confirmBtn = inputGroup.querySelector('.tag-confirm-btn');
        const cancelBtn = inputGroup.querySelector('.tag-cancel-btn');

        if (input && confirmBtn && cancelBtn) {
            confirmBtn.addEventListener('click', () => {
                const text = input.value.trim();
                if (text) {
                    this.addTag(container, text, category);
                    input.value = '';
                    this.hideTagInput(inputGroup);
                }
            });

            cancelBtn.addEventListener('click', () => {
                input.value = '';
                this.hideTagInput(inputGroup);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
        }

        // 初始化已有标签的删除功能
        this.initExistingTags(container);
    }

    // 初始化已有标签
    initExistingTags(container) {
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => {
            const removeBtn = tag.querySelector('.tag-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeTag(tag);
                });
            }
        });
    }

    // 显示标签输入框
    showTagInput(inputGroup) {
        inputGroup.style.display = 'flex';
        const input = inputGroup.querySelector('.tag-input');
        if (input) {
            input.focus();
        }
    }

    // 隐藏标签输入框
    hideTagInput(inputGroup) {
        inputGroup.style.display = 'none';
    }

    // 添加标签
    addTag(container, text, category) {
        // 检查是否已存在相同标签
        const existingTags = container.querySelectorAll('.tag-text');
        for (let tag of existingTags) {
            if (tag.textContent === text) {
                this.showNotification('该词条已存在', 'warning');
                return;
            }
        }

        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.setAttribute('data-category', category);
        tagElement.innerHTML = `
            <span class="tag-text">${text}</span>
            <button type="button" class="tag-remove">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加删除事件
        const removeBtn = tagElement.querySelector('.tag-remove');
        removeBtn.addEventListener('click', () => {
            this.removeTag(tagElement);
        });

        container.appendChild(tagElement);

        // 移除空状态
        container.classList.remove('empty');
    }

    // 移除标签
    removeTag(tagElement) {
        tagElement.style.animation = 'tagFadeOut 0.3s ease';
        setTimeout(() => {
            tagElement.remove();

            // 检查是否为空
            const container = tagElement.parentNode;
            if (container && container.children.length === 0) {
                container.classList.add('empty');
            }
        }, 300);
    }

    // 初始化预设标签
    initPresetTags() {
        const presetTags = document.querySelectorAll('.preset-tag');
        presetTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const text = tag.getAttribute('data-text');
                const section = tag.closest('.form-section');
                const container = section.querySelector('.tags-container');
                const category = this.getCategoryFromContainer(container);

                if (text && container && category) {
                    this.addTag(container, text, category);
                }
            });
        });
    }

    // 根据容器获取分类
    getCategoryFromContainer(container) {
        if (container.id === 'featuresContainer') return 'features';
        if (container.id === 'thinkingContainer') return 'thinking';
        if (container.id === 'basisContainer') return 'basis';
        return 'unknown';
    }

    // 文件上传功能
    initFileUpload() {
        // 上传区域点击事件
        this.uploadArea.addEventListener('click', () => {
            this.imageInput.click();
        });

        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // 文件选择事件
        this.imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // 移除图像
        if (this.removeImage) {
            this.removeImage.addEventListener('click', () => {
                this.clearFileUpload();
            });
        }
    }

    // 处理文件上传
    handleFileUpload(file) {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/avi'];
        const allowedExtensions = ['.dcm', '.dicom'];

        const isValidType = allowedTypes.includes(file.type) ||
                           allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isValidType) {
            this.showNotification('请上传支持的文件格式：JPG, PNG, DICOM, AVI', 'error');
            return;
        }

        // 文件大小限制 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showNotification('文件大小不能超过50MB', 'error');
            return;
        }

        // 显示文件信息
        this.fileName.textContent = file.name;

        // 如果是图像文件，显示预览
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewImg.src = e.target.result;
                this.showImagePreview();
            };
            reader.readAsDataURL(file);
        } else {
            // 对于非图像文件，显示文件图标
            this.previewImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSAzNUg2NVY2NUgzNVYzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
            this.showImagePreview();
        }
    }

    // 显示图像预览
    showImagePreview() {
        const placeholder = this.uploadArea.querySelector('.upload-placeholder');
        if (placeholder) placeholder.style.display = 'none';
        if (this.imagePreview) this.imagePreview.style.display = 'block';
    }

    // 清除文件上传
    clearFileUpload() {
        if (this.imageInput) this.imageInput.value = '';
        if (this.imagePreview) this.imagePreview.style.display = 'none';
        const placeholder = this.uploadArea.querySelector('.upload-placeholder');
        if (placeholder) placeholder.style.display = 'block';
        if (this.previewImg) this.previewImg.src = '';
        if (this.fileName) this.fileName.textContent = '';
    }

    // 表单验证功能
    initFormValidation() {
        // 表单提交
        if (this.medicalDataForm) {
            this.medicalDataForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // 预览按钮
        if (this.previewBtn) {
            this.previewBtn.addEventListener('click', () => {
                this.showFormPreview();
            });
        }

        // 重置按钮
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // 关闭模态框
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (this.previewModal) {
            this.previewModal.addEventListener('click', (e) => {
                if (e.target === this.previewModal) {
                    this.hideModal();
                }
            });
        }
    }

    // 收集词条数据
    collectTagsData(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];

        const tags = container.querySelectorAll('.tag-text');
        return Array.from(tags).map(tag => tag.textContent);
    }

    // 表单验证
    validateForm() {
        const errors = [];

        // 检查图像上传
        if (!this.imageInput || !this.imageInput.files.length) {
            errors.push('请上传医学图像文件');
        }

        // 检查图像特征分析词条
        const features = this.collectTagsData('featuresContainer');
        if (features.length === 0) {
            errors.push('请至少添加一个图像特征');
        }

        // 检查诊断联想词条
        const thinking = this.collectTagsData('thinkingContainer');
        if (thinking.length === 0) {
            errors.push('请至少添加一个诊断联想');
        }

        // 检查诊断依据词条
        const basis = this.collectTagsData('basisContainer');
        if (basis.length === 0) {
            errors.push('请至少添加一个诊断依据');
        }

        // 检查诊断分类
        if (!document.querySelector('input[name="diagnosisType"]:checked')) {
            errors.push('请选择诊断分类');
        }

        // 检查详细诊断
        const detailedDiagnosis = document.getElementById('detailedDiagnosis');
        if (!detailedDiagnosis || !detailedDiagnosis.value.trim()) {
            errors.push('请填写详细诊断');
        }

        return errors;
    }

    // 表单提交处理
    handleFormSubmit() {
        const errors = this.validateForm();
        if (errors.length > 0) {
            this.showNotification('请完善以下信息：\n' + errors.join('\n'), 'error');
            return;
        }

        const formData = this.collectFormData();

        // 模拟提交到服务器
        this.submitData(formData);
    }

    // 收集表单数据
    collectFormData() {
        const diagnosisTypeMap = {
            'benign': '良性',
            'malignant': '恶性',
            'uncertain': '未定',
            'other': '其他'
        };

        const diagnosisType = document.querySelector('input[name="diagnosisType"]:checked')?.value;

        return {
            fileName: this.fileName ? this.fileName.textContent : '',
            imagePreview: this.previewImg ? this.previewImg.src : '',
            imageFeatures: this.collectTagsData('featuresContainer'),
            diagnosticThinking: this.collectTagsData('thinkingContainer'),
            diagnosticBasis: this.collectTagsData('basisContainer'),
            diagnosisType: diagnosisType,
            diagnosisTypeText: diagnosisTypeMap[diagnosisType] || '',
            detailedDiagnosis: document.getElementById('detailedDiagnosis')?.value.trim() || '',
            timestamp: new Date().toISOString()
        };
    }

    // 提交数据
    async submitData(formData) {
        try {
            // 显示加载状态
            this.showNotification('正在保存数据...', 'info');

            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 保存到本地存储（模拟数据库）
            this.saveToLocalStorage(formData);

            // 显示成功消息
            this.showNotification('数据保存成功！', 'success');

            // 重置表单
            this.resetForm();

            // 如果在数据管理页面，刷新表格
            if (this.currentPage === 'data-management') {
                this.refreshDataTable();
            }

        } catch (error) {
            this.showNotification('保存失败，请重试', 'error');
            console.error('Submit error:', error);
        }
    }

    // 保存到本地存储
    saveToLocalStorage(formData) {
        let savedData = JSON.parse(localStorage.getItem('medicalData') || '[]');
        formData.id = Date.now().toString();
        savedData.unshift(formData);

        // 限制存储数量
        if (savedData.length > 100) {
            savedData = savedData.slice(0, 100);
        }

        localStorage.setItem('medicalData', JSON.stringify(savedData));
    }

    // 显示表单预览
    showFormPreview() {
        const errors = this.validateForm();
        if (errors.length > 0) {
            this.showNotification('请完善以下信息：\n' + errors.join('\n'), 'error');
            return;
        }

        const formData = this.collectFormData();
        this.showPreviewModal(formData);
    }

    // 显示预览模态框
    showPreviewModal(formData) {
        if (!this.previewModal || !this.previewContent) return;

        // 格式化词条显示
        const formatTags = (tags) => {
            if (!tags || tags.length === 0) return '<span style="color: #999;">暂无</span>';
            return tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('');
        };

        const previewHTML = `
            <div class="preview-section">
                <h3><i class="fas fa-image"></i> 上传图像</h3>
                <p><strong>文件名：</strong>${formData.fileName}</p>
                ${formData.imagePreview ? `<img src="${formData.imagePreview}" style="max-width: 200px; border-radius: 5px; margin-top: 10px;">` : ''}
            </div>

            <div class="preview-section">
                <h3><i class="fas fa-search"></i> 图像特征分析</h3>
                <div class="preview-tags-container">
                    ${formatTags(formData.imageFeatures)}
                </div>
            </div>

            <div class="preview-section">
                <h3><i class="fas fa-brain"></i> 诊断联想</h3>
                <div class="preview-tags-container">
                    ${formatTags(formData.diagnosticThinking)}
                </div>
            </div>

            <div class="preview-section">
                <h3><i class="fas fa-clipboard-list"></i> 诊断依据</h3>
                <div class="preview-tags-container">
                    ${formatTags(formData.diagnosticBasis)}
                </div>
            </div>

            <div class="preview-section">
                <h3><i class="fas fa-diagnoses"></i> 最终诊断</h3>
                <p><strong>分类：</strong>${formData.diagnosisTypeText}</p>
                <p><strong>详细诊断：</strong>${formData.detailedDiagnosis}</p>
            </div>
        `;

        this.previewContent.innerHTML = previewHTML;
        this.previewModal.style.display = 'flex';
    }

    // 隐藏模态框
    hideModal() {
        if (this.previewModal) {
            this.previewModal.style.display = 'none';
        }
    }

    // 重置表单
    resetForm() {
        if (confirm('确定要重置表单吗？所有数据将被清除。')) {
            if (this.medicalDataForm) {
                this.medicalDataForm.reset();
            }
            this.clearFileUpload();
            this.clearAllTags();
        }
    }

    // 清除所有词条
    clearAllTags() {
        const containers = ['featuresContainer', 'thinkingContainer', 'basisContainer'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                // 移除所有词条
                const tags = container.querySelectorAll('.tag-item');
                tags.forEach(tag => tag.remove());

                // 恢复默认词条
                this.restoreDefaultTags(containerId);
            }
        });
    }

    // 恢复默认词条
    restoreDefaultTags(containerId) {
        const defaultTags = {
            'featuresContainer': [
                { text: '边界清晰', category: 'features' },
                { text: '回声均匀', category: 'features' },
                { text: '形态规则', category: 'features' }
            ],
            'thinkingContainer': [
                { text: '考虑良性结节', category: 'thinking' },
                { text: '结合BRADS分级', category: 'thinking' }
            ],
            'basisContainer': [
                { text: '无钙化表现', category: 'basis' },
                { text: '血流信号正常', category: 'basis' }
            ]
        };

        const container = document.getElementById(containerId);
        const tags = defaultTags[containerId];

        if (container && tags) {
            tags.forEach(tagData => {
                this.addTag(container, tagData.text, tagData.category);
            });
        }
    }

    // 数据表格管理
    initDataTable() {
        // 初始化表格数据
        this.refreshDataTable();

        // 筛选功能
        const filterSelects = document.querySelectorAll('.filter-select');
        const filterInput = document.querySelector('.filter-input');

        filterSelects.forEach(select => {
            select.addEventListener('change', () => this.filterTable());
        });

        if (filterInput) {
            filterInput.addEventListener('input', () => this.filterTable());
        }
    }

    // 刷新数据表格
    refreshDataTable() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;

        const savedData = JSON.parse(localStorage.getItem('medicalData') || '[]');

        if (savedData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        暂无数据
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = savedData.map((item, index) => {
            const date = new Date(item.timestamp).toLocaleString('zh-CN');
            const statusClass = this.getStatusClass(item.diagnosisType);

            return `
                <tr>
                    <td>${String(index + 1).padStart(3, '0')}</td>
                    <td>${this.getImageTypeText(item.fileName)}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${item.diagnosisTypeText}</span></td>
                    <td>${item.detailedDiagnosis}</td>
                    <td><span class="status-badge status-completed">已完成</span></td>
                    <td>
                        <button class="action-btn view-btn" onclick="adminSystem.viewData('${item.id}')" title="查看">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="adminSystem.editData('${item.id}')" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="adminSystem.deleteData('${item.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 获取状态样式类
    getStatusClass(diagnosisType) {
        const classMap = {
            'benign': 'status-benign',
            'malignant': 'status-malignant',
            'uncertain': 'status-uncertain',
            'other': 'status-uncertain'
        };
        return classMap[diagnosisType] || 'status-uncertain';
    }

    // 获取图像类型文本
    getImageTypeText(fileName) {
        if (!fileName) return '未知';
        const ext = fileName.toLowerCase();
        if (ext.includes('ultrasound') || ext.includes('超声')) return '乳腺超声';
        if (ext.includes('ct')) return 'CT';
        if (ext.includes('mri')) return 'MRI';
        if (ext.includes('xray') || ext.includes('x-ray')) return 'X光';
        return '其他';
    }

    // 表格筛选
    filterTable() {
        // 这里可以实现筛选逻辑
        console.log('筛选表格');
    }

    // 查看数据
    viewData(id) {
        const savedData = JSON.parse(localStorage.getItem('medicalData') || '[]');
        const item = savedData.find(d => d.id === id);
        if (item) {
            this.showPreviewModal(item);
        }
    }

    // 编辑数据
    editData(id) {
        this.showNotification('编辑功能开发中', 'info');
    }

    // 删除数据
    deleteData(id) {
        if (confirm('确定要删除这条数据吗？')) {
            let savedData = JSON.parse(localStorage.getItem('medicalData') || '[]');
            savedData = savedData.filter(d => d.id !== id);
            localStorage.setItem('medicalData', JSON.stringify(savedData));
            this.refreshDataTable();
            this.showNotification('数据已删除', 'success');
        }
    }

    // 加载模型评分系统
    loadModelScoringSystem() {
        const container = document.getElementById('modelScoringContainer');
        if (!container) return;

        // 检查是否已经加载过
        if (container.querySelector('.model-scoring-content')) {
            return;
        }

        // 显示加载状态
        container.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>正在加载评分系统...</p>
            </div>
        `;

        // 模拟加载过程
        setTimeout(() => {
            this.renderModelScoringSystem(container);
        }, 500);
    }

    // 渲染模型评分系统
    renderModelScoringSystem(container) {
        // 从localStorage获取最新的诊断数据作为评分对象
        const savedData = JSON.parse(localStorage.getItem('medicalData') || '[]');
        const latestCase = savedData.length > 0 ? savedData[savedData.length - 1] : null;

        const scoringHTML = this.generateScoringHTML(latestCase);
        container.innerHTML = scoringHTML;

        // 初始化评分系统
        this.initScoringSystem();
    }

    // 生成评分系统HTML
    generateScoringHTML(caseData) {
        const caseId = caseData ? caseData.id : 'DEMO-001';
        const imageType = caseData ? this.getImageTypeFromFileName(caseData.fileName) : '乳腺超声';
        const features = caseData ? caseData.imageFeatures : ['边界清晰', '回声均匀', '形态规则'];
        const thinking = caseData ? caseData.diagnosticThinking : ['考虑良性结节', '结合BRADS分级'];
        const basis = caseData ? caseData.diagnosticBasis : ['无钙化表现', '血流信号正常'];
        const diagnosis = caseData ? caseData.detailedDiagnosis : '良性结节，BRADS 3类';

        return `
            <div class="model-scoring-content">
                <!-- 案例信息 -->
                <section class="case-info-section">
                    <div class="section-header">
                        <h3>📋 案例信息</h3>
                    </div>
                    <div class="case-info-grid">
                        <div class="info-item">
                            <label>案例ID:</label>
                            <span>${caseId}</span>
                        </div>
                        <div class="info-item">
                            <label>图像类型:</label>
                            <span>${imageType}</span>
                        </div>
                        <div class="info-item">
                            <label>AI模型:</label>
                            <span>MedicalAI-v2.1</span>
                        </div>
                        <div class="info-item">
                            <label>评估时间:</label>
                            <span>${new Date().toLocaleString('zh-CN')}</span>
                        </div>
                    </div>
                </section>

                <!-- AI诊断结果 -->
                <section class="ai-result-section">
                    <div class="section-header">
                        <h3>🤖 AI诊断结果</h3>
                    </div>
                    <div class="ai-result-content">
                        <div class="result-item">
                            <h4>图像特征分析</h4>
                            <div class="feature-tags">
                                ${features.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        <div class="result-item">
                            <h4>诊断联想</h4>
                            <div class="thinking-tags">
                                ${thinking.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        <div class="result-item">
                            <h4>诊断依据</h4>
                            <div class="basis-tags">
                                ${basis.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        <div class="result-item">
                            <h4>最终诊断</h4>
                            <div class="final-diagnosis">
                                <span class="diagnosis-detail">${diagnosis}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 评分表单 -->
                <section class="scoring-section">
                    <div class="section-header">
                        <h3>⭐ 专家评分</h3>
                        <p>请根据AI诊断结果的质量进行评分（1-5分制）</p>
                    </div>
                    <form id="modelScoringForm" class="scoring-form">
                        ${this.generateScoringDimensions()}

                        <!-- 总体评价 -->
                        <div class="overall-section">
                            <h4>💬 总体评价</h4>
                            <textarea id="overallComment" class="overall-comment" placeholder="请提供对该AI诊断结果的总体评价和改进建议..."></textarea>
                        </div>

                        <!-- 提交按钮 -->
                        <div class="submit-section">
                            <button type="button" id="previewScoreBtn" class="btn btn-secondary">预览评分</button>
                            <button type="submit" id="submitScoreBtn" class="btn btn-primary">提交评分</button>
                            <button type="button" id="resetScoreBtn" class="btn btn-outline">重置表单</button>
                        </div>
                    </form>
                </section>

                <!-- 评分结果预览 -->
                <section id="scorePreviewSection" class="score-preview-section" style="display: none;">
                    <div class="section-header">
                        <h3>📊 评分结果预览</h3>
                    </div>
                    <div class="score-summary">
                        <div class="score-chart">
                            ${this.generateScoreChart()}
                        </div>
                        <div class="overall-score">
                            <div class="overall-score-circle">
                                <span class="overall-score-value" id="overallScoreValue">0.0</span>
                                <span class="overall-score-label">总分</span>
                            </div>
                            <div class="score-level" id="scoreLevel">待评分</div>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    // 响应式处理
    initResponsive() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 初始化时处理一次
        this.handleResize();
    }

    // 生成评分维度HTML
    generateScoringDimensions() {
        const dimensions = [
            {
                id: 'accuracy',
                name: '准确性',
                icon: '🎯',
                description: '医学内容是否正确（硬性指标）',
                critical: true,
                levels: ['严重错误', '明显错误', '基本正确', '准确可靠', '完全准确']
            },
            {
                id: 'completeness',
                name: '完整性',
                icon: '📋',
                description: '是否覆盖关键诊疗步骤（问诊、检查、治疗建议）',
                critical: false,
                levels: ['严重缺失', '缺失较多', '基本完整', '较为完整', '非常完整']
            },
            {
                id: 'relevance',
                name: '相关性',
                icon: '🎯',
                description: '回答是否聚焦问题核心（如不跑题）',
                critical: false,
                levels: ['完全跑题', '偏离主题', '基本相关', '高度相关', '完全切题']
            },
            {
                id: 'readability',
                name: '可读性',
                icon: '📖',
                description: '表述是否清晰易懂（专业术语过多/适中/患者友好）',
                critical: false,
                levels: ['难以理解', '表述混乱', '基本清晰', '清晰易懂', '患者友好']
            },
            {
                id: 'safety',
                name: '安全性',
                icon: '🛡️',
                description: '是否包含风险警示（药物副作用、急症处理优先级）',
                critical: false,
                levels: ['存在风险', '警示不足', '基本安全', '安全可靠', '高度安全']
            }
        ];

        return dimensions.map(dim => `
            <div class="scoring-item ${dim.critical ? 'critical' : ''}">
                <div class="scoring-header">
                    <h4>${dim.icon} ${dim.name} ${dim.critical ? '<span class="critical-badge">一票否决</span>' : ''}</h4>
                    <p>${dim.description}</p>
                </div>
                <div class="rating-group">
                    <div class="rating-scale">
                        ${dim.levels.map((level, index) => `
                            <input type="radio" id="${dim.id}-${index + 1}" name="${dim.id}" value="${index + 1}">
                            <label for="${dim.id}-${index + 1}" class="rating-label" data-score="${index + 1}">
                                <span class="score">${index + 1}</span>
                                <span class="desc">${level}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <textarea class="comment-input" placeholder="请详细说明${dim.name}评分理由..."></textarea>
            </div>
        `).join('');
    }

    // 生成评分图表HTML
    generateScoreChart() {
        const dimensions = ['accuracy', 'completeness', 'relevance', 'readability', 'safety'];
        const labels = ['准确性', '完整性', '相关性', '可读性', '安全性'];

        return dimensions.map((dim, index) => `
            <div class="score-item">
                <span class="score-label">${labels[index]}</span>
                <div class="score-bar">
                    <div class="score-fill" data-dimension="${dim}"></div>
                </div>
                <span class="score-value" id="${dim}Score">-</span>
            </div>
        `).join('');
    }

    // 初始化评分系统
    initScoringSystem() {
        // 初始化评分系统实例
        if (window.MedicalAIScoringSystem) {
            this.scoringSystem = new window.MedicalAIScoringSystem();
        } else {
            // 如果评分系统类不存在，动态加载
            this.loadScoringSystemScript();
        }
    }

    // 动态加载评分系统脚本
    loadScoringSystemScript() {
        const script = document.createElement('script');
        script.src = 'model-scoring-script.js';
        script.onload = () => {
            if (window.MedicalAIScoringSystem) {
                this.scoringSystem = new window.MedicalAIScoringSystem();
            }
        };
        document.head.appendChild(script);
    }

    // 从文件名获取图像类型
    getImageTypeFromFileName(fileName) {
        if (!fileName) return '未知';
        const name = fileName.toLowerCase();
        if (name.includes('ultrasound') || name.includes('超声')) return '乳腺超声';
        if (name.includes('ct')) return 'CT';
        if (name.includes('mri')) return 'MRI';
        if (name.includes('xray') || name.includes('x-ray')) return 'X光';
        return '医学图像';
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (window.innerWidth <= 768) {
            // 移动端：隐藏侧边栏，主内容占满
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (mainContent) mainContent.style.marginLeft = '0';
        } else {
            // 桌面端：恢复正常布局
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (mainContent && !this.sidebarCollapsed) {
                mainContent.style.marginLeft = '260px';
            }
        }
    }

    // 通知系统
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加样式
        this.addNotificationStyles();

        // 添加到页面
        document.body.appendChild(notification);

        // 关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // 自动关闭
        setTimeout(() => {
            this.removeNotification(notification);
        }, type === 'error' ? 5000 : 3000);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-left: 4px solid #2196F3;
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification-success {
                border-left-color: #4CAF50;
            }

            .notification-error {
                border-left-color: #f44336;
            }

            .notification-warning {
                border-left-color: #ff9800;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }

            .notification-content i {
                font-size: 1.2rem;
            }

            .notification-success .notification-content i {
                color: #4CAF50;
            }

            .notification-error .notification-content i {
                color: #f44336;
            }

            .notification-warning .notification-content i {
                color: #ff9800;
            }

            .notification-info .notification-content i {
                color: #2196F3;
            }

            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.3s ease;
            }

            .notification-close:hover {
                background: #f0f0f0;
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化系统
const adminSystem = new AdminSystem();

// 现代化医学AI图像标注系统
class ModernMedicalAIAnnotationSystem {
    constructor() {
        this.currentTool = 'select';
        this.annotations = [];
        this.annotationCounter = 0;
        this.currentImageIndex = 0;
        this.uploadedImages = [];
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentAnnotation = null;
        this.zoomLevel = 1;
        this.minZoom = 0.1;
        this.maxZoom = 5;
        this.zoomStep = 0.2;

        this.init();
    }

    init() {
        this.initUpload();
        this.initToolbar();
        this.initImageControls();
        this.initAnalysis();
        this.initAnalysisToggle();
        this.initQuickActions();
    }

    // 初始化文件上传
    initUpload() {
        const uploadArea = document.getElementById('annotationUploadArea');
        const fileInput = document.getElementById('annotationImageInput');

        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    // 处理文件上传
    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        src: e.target.result,
                        annotations: [],
                        analyzed: false
                    };
                    this.uploadedImages.push(imageData);
                    this.updateThumbnails();

                    if (this.uploadedImages.length === 1) {
                        this.showImage(0);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 更新缩略图
    updateThumbnails() {
        const thumbnailList = document.getElementById('thumbnailList');
        const uploadedImagesList = document.getElementById('uploadedImagesList');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');

        if (!thumbnailList) return;

        if (this.uploadedImages.length === 0) {
            uploadedImagesList.style.display = 'none';
            uploadPlaceholder.style.display = 'flex';
            return;
        }

        uploadedImagesList.style.display = 'block';
        uploadPlaceholder.style.display = 'none';

        thumbnailList.innerHTML = this.uploadedImages.map((img, index) => `
            <div class="modern-thumbnail ${index === this.currentImageIndex ? 'active' : ''}"
                 onclick="modernMedicalAI.showImage(${index})">
                <img src="${img.src}" alt="${img.name}">
                <button class="modern-thumbnail-remove" onclick="event.stopPropagation(); modernMedicalAI.removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // 显示图像
    showImage(index) {
        if (index < 0 || index >= this.uploadedImages.length) return;

        this.currentImageIndex = index;
        const imageData = this.uploadedImages[index];

        // 显示图像工作区
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('imageWorkspace').style.display = 'flex';
        document.getElementById('imageControls').style.display = 'flex';
        document.getElementById('analysisSection').style.display = 'block';

        // 更新图像
        const currentImage = document.getElementById('currentImage');
        currentImage.src = imageData.src;
        currentImage.onload = () => {
            this.initCanvas();
            this.loadAnnotations(imageData.annotations);
        };

        // 更新计数器
        document.getElementById('imageCounter').textContent = `${index + 1} / ${this.uploadedImages.length}`;

        // 更新缩略图
        this.updateThumbnails();

        // 更新控制按钮
        this.updateImageControls();

        // 自动分析
        if (!imageData.analyzed) {
            this.autoAnalyze();
            imageData.analyzed = true;
        }
    }

    // 删除图像
    removeImage(index) {
        this.uploadedImages.splice(index, 1);

        if (this.uploadedImages.length === 0) {
            document.getElementById('emptyState').style.display = 'flex';
            document.getElementById('imageWorkspace').style.display = 'none';
            document.getElementById('imageControls').style.display = 'none';
            document.getElementById('analysisSection').style.display = 'none';
            this.currentImageIndex = 0;
        } else {
            if (this.currentImageIndex >= this.uploadedImages.length) {
                this.currentImageIndex = this.uploadedImages.length - 1;
            }
            this.showImage(this.currentImageIndex);
        }

        this.updateThumbnails();
    }

    // 初始化Canvas
    initCanvas() {
        const canvas = document.getElementById('annotationCanvas');
        const currentImage = document.getElementById('currentImage');

        if (!canvas || !currentImage) return;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 设置canvas尺寸
        const rect = currentImage.getBoundingClientRect();
        canvas.width = currentImage.offsetWidth;
        canvas.height = currentImage.offsetHeight;
        canvas.style.width = currentImage.offsetWidth + 'px';
        canvas.style.height = currentImage.offsetHeight + 'px';

        // 绑定事件
        this.bindCanvasEvents();
        this.redrawAnnotations();
    }

    // 绑定Canvas事件
    bindCanvasEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // 鼠标事件处理
    handleMouseDown(e) {
        if (this.currentTool === 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isDrawing = true;

        if (this.currentTool === 'rectangle') {
            this.currentAnnotation = {
                type: 'rectangle',
                startX: this.startX,
                startY: this.startY,
                endX: this.startX,
                endY: this.startY
            };
        }
    }

    handleMouseMove(e) {
        if (!this.isDrawing || this.currentTool === 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (this.currentTool === 'rectangle' && this.currentAnnotation) {
            this.currentAnnotation.endX = currentX;
            this.currentAnnotation.endY = currentY;
            this.redrawAnnotations();
            this.drawTemporaryAnnotation(this.currentAnnotation);
        }
    }

    handleMouseUp(e) {
        if (!this.isDrawing || this.currentTool === 'select') return;

        this.isDrawing = false;

        if (this.currentAnnotation) {
            const minSize = 10;
            const width = Math.abs(this.currentAnnotation.endX - this.currentAnnotation.startX);
            const height = Math.abs(this.currentAnnotation.endY - this.currentAnnotation.startY);

            if (width > minSize && height > minSize) {
                this.addAnnotation(this.currentAnnotation);
            }

            this.currentAnnotation = null;
            this.redrawAnnotations();
        }
    }

    handleCanvasClick(e) {
        if (this.currentTool === 'arrow' || this.currentTool === 'text') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const annotation = {
                type: this.currentTool,
                x: x,
                y: y
            };

            if (this.currentTool === 'text') {
                const text = prompt('请输入标注文本：');
                if (text) {
                    annotation.text = text;
                    this.addAnnotation(annotation);
                }
            } else {
                this.addAnnotation(annotation);
            }
        }
    }

    // 添加标注
    addAnnotation(annotation) {
        this.annotationCounter++;
        const annotationData = {
            id: this.annotationCounter,
            ...annotation,
            imageIndex: this.currentImageIndex,
            aiSuggested: false
        };

        this.annotations.push(annotationData);

        if (this.uploadedImages[this.currentImageIndex]) {
            this.uploadedImages[this.currentImageIndex].annotations.push(annotationData);
        }

        this.updateAnnotationList();
        this.redrawAnnotations();
    }

    // 加载标注
    loadAnnotations(annotations) {
        this.annotations = this.annotations.filter(ann => ann.imageIndex !== this.currentImageIndex);
        annotations.forEach(ann => {
            this.annotations.push({...ann, imageIndex: this.currentImageIndex});
        });
        this.updateAnnotationList();
        this.redrawAnnotations();
    }

    // 重绘标注
    redrawAnnotations() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        currentAnnotations.forEach(annotation => {
            this.drawAnnotation(annotation);
        });
    }

    // 绘制标注
    drawAnnotation(annotation) {
        if (!this.ctx) return;

        const isAI = annotation.aiSuggested;
        const color = isAI ? '#667eea' : '#10b981';

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = color;
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        if (isAI) {
            this.ctx.setLineDash([8, 4]);
        } else {
            this.ctx.setLineDash([]);
        }

        switch (annotation.type) {
            case 'rectangle':
                const width = annotation.endX - annotation.startX;
                const height = annotation.endY - annotation.startY;
                this.ctx.strokeRect(annotation.startX, annotation.startY, width, height);

                const idText = isAI ? `AI${annotation.id}` : `#${annotation.id}`;
                const textWidth = this.ctx.measureText(idText).width + 8;
                this.ctx.fillRect(annotation.startX, annotation.startY - 18, textWidth, 18);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(idText, annotation.startX + 4, annotation.startY - 4);
                break;

            case 'arrow':
                this.ctx.beginPath();
                this.ctx.moveTo(annotation.x - 20, annotation.y - 20);
                this.ctx.lineTo(annotation.x, annotation.y);
                this.ctx.lineTo(annotation.x - 8, annotation.y - 8);
                this.ctx.moveTo(annotation.x, annotation.y);
                this.ctx.lineTo(annotation.x - 8, annotation.y + 8);
                this.ctx.stroke();

                const arrowIdText = isAI ? `AI${annotation.id}` : `#${annotation.id}`;
                const arrowTextWidth = this.ctx.measureText(arrowIdText).width + 8;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(annotation.x - 30, annotation.y - 35, arrowTextWidth, 18);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(arrowIdText, annotation.x - 26, annotation.y - 21);
                break;

            case 'text':
                this.ctx.fillStyle = color;
                this.ctx.fillText(annotation.text || '', annotation.x, annotation.y);

                const textIdText = isAI ? `AI${annotation.id}` : `#${annotation.id}`;
                const textIdWidth = this.ctx.measureText(textIdText).width + 8;
                this.ctx.fillRect(annotation.x, annotation.y - 30, textIdWidth, 18);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(textIdText, annotation.x + 4, annotation.y - 16);
                break;
        }

        this.ctx.setLineDash([]);
    }

    // 绘制临时标注
    drawTemporaryAnnotation(annotation) {
        if (!this.ctx) return;

        this.ctx.strokeStyle = '#6b7280';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);

        if (annotation.type === 'rectangle') {
            const width = annotation.endX - annotation.startX;
            const height = annotation.endY - annotation.startY;
            this.ctx.strokeRect(annotation.startX, annotation.startY, width, height);
        }

        this.ctx.setLineDash([]);
    }

    // 更新标注列表
    updateAnnotationList() {
        const annotationList = document.getElementById('annotationList');
        const annotationCount = document.getElementById('annotationCount');

        if (!annotationList || !annotationCount) return;

        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);

        annotationCount.textContent = currentAnnotations.length;

        if (currentAnnotations.length === 0) {
            annotationList.innerHTML = `
                <div class="modern-annotation-empty">
                    <i class="fas fa-tags"></i>
                    <p>暂无标注</p>
                </div>
            `;
            return;
        }

        annotationList.innerHTML = currentAnnotations.map(annotation => {
            const isAI = annotation.aiSuggested;
            let description = '';

            switch (annotation.type) {
                case 'rectangle':
                    description = isAI ? 'AI识别区域' : '矩形标注';
                    break;
                case 'arrow':
                    description = isAI ? 'AI关注点' : '箭头指向';
                    break;
                case 'text':
                    description = annotation.text || '文本标注';
                    break;
            }

            const idClass = isAI ? 'ai' : 'user';
            const idText = isAI ? `AI${annotation.id}` : `#${annotation.id}`;
            const itemClass = isAI ? 'modern-annotation-item ai-suggested' : 'modern-annotation-item';

            return `
                <div class="${itemClass}" data-id="${annotation.id}">
                    <div class="modern-annotation-info">
                        <span class="modern-annotation-id ${idClass}">${idText}</span>
                        <span class="modern-annotation-text">${description}</span>
                    </div>
                    <div class="modern-annotation-actions">
                        <button class="modern-annotation-action" onclick="modernMedicalAI.highlightAnnotation(${annotation.id})" title="高亮">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${isAI ?
                            `<button class="modern-annotation-action" onclick="modernMedicalAI.confirmAnnotation(${annotation.id})" title="确认" style="color: #10b981;">
                                <i class="fas fa-check"></i>
                            </button>` :
                            `<button class="modern-annotation-action" onclick="modernMedicalAI.editAnnotation(${annotation.id})" title="编辑">
                                <i class="fas fa-edit"></i>
                            </button>`
                        }
                        <button class="modern-annotation-action" onclick="modernMedicalAI.deleteAnnotation(${annotation.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 高亮标注
    highlightAnnotation(id) {
        const annotation = this.annotations.find(ann => ann.id === id);
        if (!annotation) return;

        this.redrawAnnotations();

        // 高亮绘制
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 3;
        this.drawAnnotation({...annotation, highlighted: true});

        // 高亮列表项
        document.querySelectorAll('.modern-annotation-item').forEach(item => {
            item.classList.remove('highlighted');
        });
        document.querySelector(`[data-id="${id}"]`)?.classList.add('highlighted');
    }

    // 确认AI标注
    confirmAnnotation(id) {
        const annotation = this.annotations.find(ann => ann.id === id);
        if (!annotation || !annotation.aiSuggested) return;

        annotation.aiSuggested = false;

        if (this.uploadedImages[this.currentImageIndex]) {
            const imgAnnotation = this.uploadedImages[this.currentImageIndex].annotations.find(ann => ann.id === id);
            if (imgAnnotation) {
                imgAnnotation.aiSuggested = false;
            }
        }

        this.updateAnnotationList();
        this.redrawAnnotations();
        this.showNotification('已确认AI标注', 'success');
    }

    // 编辑标注
    editAnnotation(id) {
        const annotation = this.annotations.find(ann => ann.id === id);
        if (!annotation) return;

        if (annotation.type === 'text') {
            const newText = prompt('编辑标注文本：', annotation.text || '');
            if (newText !== null) {
                annotation.text = newText;

                if (this.uploadedImages[this.currentImageIndex]) {
                    const imgAnnotation = this.uploadedImages[this.currentImageIndex].annotations.find(ann => ann.id === id);
                    if (imgAnnotation) {
                        imgAnnotation.text = newText;
                    }
                }

                this.updateAnnotationList();
                this.redrawAnnotations();
            }
        }
    }

    // 删除标注
    deleteAnnotation(id) {
        if (confirm('确定要删除这个标注吗？')) {
            this.annotations = this.annotations.filter(ann => ann.id !== id);

            if (this.uploadedImages[this.currentImageIndex]) {
                this.uploadedImages[this.currentImageIndex].annotations =
                    this.uploadedImages[this.currentImageIndex].annotations.filter(ann => ann.id !== id);
            }

            this.updateAnnotationList();
            this.redrawAnnotations();
        }
    }

    // 初始化工具栏
    initToolbar() {
        const toolBtns = document.querySelectorAll('.modern-tool-btn');

        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;

                if (this.canvas) {
                    switch (this.currentTool) {
                        case 'select':
                            this.canvas.style.cursor = 'default';
                            break;
                        case 'rectangle':
                            this.canvas.style.cursor = 'crosshair';
                            break;
                        case 'arrow':
                        case 'text':
                            this.canvas.style.cursor = 'pointer';
                            break;
                    }
                }
            });
        });

        // 撤销和清除按钮
        document.getElementById('undoAnnotationBtn')?.addEventListener('click', () => {
            this.undoLastAnnotation();
        });

        document.getElementById('clearAnnotationsBtn')?.addEventListener('click', () => {
            if (confirm('确定要清除当前图像的所有标注吗？')) {
                this.clearCurrentAnnotations();
            }
        });
    }

    // 初始化图像控制
    initImageControls() {
        document.getElementById('prevImageBtn')?.addEventListener('click', () => {
            if (this.currentImageIndex > 0) {
                this.showImage(this.currentImageIndex - 1);
            }
        });

        document.getElementById('nextImageBtn')?.addEventListener('click', () => {
            if (this.currentImageIndex < this.uploadedImages.length - 1) {
                this.showImage(this.currentImageIndex + 1);
            }
        });
    }

    // 更新图像控制按钮
    updateImageControls() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');

        if (prevBtn) prevBtn.disabled = this.currentImageIndex <= 0;
        if (nextBtn) nextBtn.disabled = this.currentImageIndex >= this.uploadedImages.length - 1;
    }

    // 初始化分析功能
    initAnalysis() {
        document.getElementById('startAnalysisBtn')?.addEventListener('click', () => {
            this.startAnalysis();
        });

        document.getElementById('clearInputBtn')?.addEventListener('click', () => {
            if (confirm('确定要重置所有内容吗？')) {
                this.clearAll();
            }
        });
    }

    // 初始化分析结果折叠功能
    initAnalysisToggle() {
        const toggleHeader = document.getElementById('analysisToggleHeader');
        const toggleBtn = document.getElementById('analysisToggleBtn');
        const contentWrapper = document.getElementById('analysisContentWrapper');

        if (toggleHeader && toggleBtn && contentWrapper) {
            toggleHeader.addEventListener('click', () => {
                this.toggleAnalysisSection();
            });
        }
    }

    // 切换分析结果区域的展开/折叠状态
    toggleAnalysisSection() {
        const toggleBtn = document.getElementById('analysisToggleBtn');
        const contentWrapper = document.getElementById('analysisContentWrapper');

        if (toggleBtn && contentWrapper) {
            const isExpanded = contentWrapper.classList.contains('expanded');

            if (isExpanded) {
                // 折叠
                contentWrapper.classList.remove('expanded');
                contentWrapper.style.display = 'none';
                toggleBtn.classList.remove('expanded');
            } else {
                // 展开
                contentWrapper.style.display = 'block';
                setTimeout(() => {
                    contentWrapper.classList.add('expanded');
                    toggleBtn.classList.add('expanded');
                }, 10);
            }
        }
    }

    // 初始化快速操作
    initQuickActions() {
        document.getElementById('confirmAllBtn')?.addEventListener('click', () => {
            this.confirmAllAIAnnotations();
        });

        document.getElementById('clearAllBtn')?.addEventListener('click', () => {
            if (confirm('确定要清除所有标注吗？')) {
                this.clearAllAnnotations();
            }
        });

        document.getElementById('exportAnnotationsBtn')?.addEventListener('click', () => {
            this.exportAnnotations();
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            default:
                notification.style.background = '#667eea';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // 动画显示
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动消失
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // 自动分析
    autoAnalyze() {
        if (!document.getElementById('autoAnnotation')?.checked) {
            // 如果没有自动标注选项，默认进行自动分析
            this.updateAnalysisStatus('analyzing', 'AI自动分析中...');

            setTimeout(() => {
                this.generateAIAnnotations();
                this.generateAnalysisResults();
            }, 2000);
        }
    }

    // 开始分析
    startAnalysis() {
        const clinicalQuestion = document.getElementById('clinicalQuestion').value;

        if (!clinicalQuestion.trim() && this.uploadedImages.length === 0) {
            this.showNotification('请输入临床问题或上传图像', 'warning');
            return;
        }

        // 自动展开分析结果区域
        this.expandAnalysisSection();

        this.updateAnalysisStatus('analyzing', '重新分析中...');

        setTimeout(() => {
            this.generateAnalysisResults();
        }, 1500);
    }

    // 展开分析结果区域
    expandAnalysisSection() {
        const toggleBtn = document.getElementById('analysisToggleBtn');
        const contentWrapper = document.getElementById('analysisContentWrapper');

        if (toggleBtn && contentWrapper) {
            contentWrapper.style.display = 'block';
            setTimeout(() => {
                contentWrapper.classList.add('expanded');
                toggleBtn.classList.add('expanded');
            }, 10);
        }
    }

    // 生成AI标注
    generateAIAnnotations() {
        if (!this.canvas) return;

        const suggestions = [
            {
                type: 'rectangle',
                startX: this.canvas.width * 0.25,
                startY: this.canvas.height * 0.2,
                endX: this.canvas.width * 0.55,
                endY: this.canvas.height * 0.45,
                aiSuggested: true
            },
            {
                type: 'arrow',
                x: this.canvas.width * 0.7,
                y: this.canvas.height * 0.3,
                aiSuggested: true
            }
        ];

        suggestions.forEach(suggestion => {
            this.annotationCounter++;
            const annotationData = {
                id: this.annotationCounter,
                ...suggestion,
                imageIndex: this.currentImageIndex
            };

            this.annotations.push(annotationData);

            if (this.uploadedImages[this.currentImageIndex]) {
                this.uploadedImages[this.currentImageIndex].annotations.push(annotationData);
            }
        });

        this.updateAnnotationList();
        this.redrawAnnotations();
        this.showNotification('AI已自动识别并标注关键区域', 'info');
    }

    // 生成分析结果
    generateAnalysisResults() {
        const clinicalQuestion = document.getElementById('clinicalQuestion').value;
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        const aiAnnotations = currentAnnotations.filter(ann => ann.aiSuggested);
        const userAnnotations = currentAnnotations.filter(ann => !ann.aiSuggested);

        // 生成思考内容
        let thinkingContent = `
            <div style="line-height: 1.6;">
                <h4 style="color: #374151; margin-bottom: 1rem;">📋 临床信息分析</h4>
                <p style="margin-bottom: 1rem;">${clinicalQuestion || '未提供具体临床描述'}</p>

                <h4 style="color: #374151; margin-bottom: 1rem;">🔍 影像学发现</h4>
                <p style="margin-bottom: 1rem;">已分析 ${this.uploadedImages.length} 张医学图像</p>
        `;

        if (aiAnnotations.length > 0) {
            thinkingContent += `
                <div style="background: #eff6ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <h5 style="color: #1d4ed8; margin-bottom: 0.5rem;">🤖 AI识别特征 (${aiAnnotations.length}个)</h5>
                    <ul style="margin: 0; padding-left: 1.5rem;">
            `;
            aiAnnotations.forEach(ann => {
                const desc = ann.type === 'rectangle' ? 'AI识别的可疑区域' : 'AI识别的关注点';
                thinkingContent += `<li style="margin-bottom: 0.25rem;"><span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">AI${ann.id}</span> ${desc}</li>`;
            });
            thinkingContent += `</ul></div>`;
        }

        if (userAnnotations.length > 0) {
            thinkingContent += `
                <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <h5 style="color: #166534; margin-bottom: 0.5rem;">👨‍⚕️ 医师标注 (${userAnnotations.length}个)</h5>
                    <ul style="margin: 0; padding-left: 1.5rem;">
            `;
            userAnnotations.forEach(ann => {
                const desc = ann.type === 'rectangle' ? '医师标注区域' : ann.type === 'text' ? ann.text : '医师关注点';
                thinkingContent += `<li style="margin-bottom: 0.25rem;"><span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">#${ann.id}</span> ${desc}</li>`;
            });
            thinkingContent += `</ul></div>`;
        }

        thinkingContent += `
                <h4 style="color: #374151; margin-bottom: 1rem;">💡 分析结论</h4>
                <p>基于AI智能识别和医师专业标注，建议重点关注标注区域的影像学特征，结合临床症状进行综合判断。</p>
            </div>
        `;

        // 生成诊断建议
        let responseContent = `
            <div style="line-height: 1.6;">
                <h4 style="color: #374151; margin-bottom: 1rem;">🩺 诊断建议</h4>
        `;

        if (currentAnnotations.length > 0) {
            responseContent += `<p style="margin-bottom: 1rem;">根据影像学表现和标注区域分析：</p><ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">`;
            currentAnnotations.forEach(ann => {
                const prefix = ann.aiSuggested ? `<span style="background: #667eea; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">AI${ann.id}</span>` : `<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">#${ann.id}</span>`;
                responseContent += `<li style="margin-bottom: 0.5rem;">${prefix} 标注区域需要进一步评估和确认</li>`;
            });
            responseContent += `</ul>`;
        }

        responseContent += `
                <h4 style="color: #374151; margin-bottom: 1rem;">📋 临床建议</h4>
                <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
                    <li style="margin-bottom: 0.5rem;">结合患者病史、体格检查及实验室检查结果</li>
                    <li style="margin-bottom: 0.5rem;">必要时考虑进一步影像学检查或病理检查</li>
                    <li style="margin-bottom: 0.5rem;">建议专科医师会诊，制定个体化诊疗方案</li>
                    <li style="margin-bottom: 0.5rem;">定期随访观察病情变化</li>
                </ul>

                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 0.875rem;"><strong>⚠️ 重要提示：</strong> 本AI分析仅供参考，最终诊断需要结合完整的临床资料由专业医师做出。</p>
                </div>
            </div>
        `;

        // 更新界面
        document.getElementById('thinkingContent').innerHTML = thinkingContent;
        document.getElementById('answerContent').innerHTML = responseContent;
        this.updateAnalysisStatus('complete', '分析完成');
    }

    // 更新分析状态
    updateAnalysisStatus(status, text) {
        const statusElement = document.getElementById('thinkingStatus');
        if (!statusElement) return;

        let className = 'status-waiting';
        if (status === 'analyzing') className = 'status-analyzing';
        if (status === 'complete') className = 'status-complete';

        statusElement.className = `modern-status-badge ${className}`;
        statusElement.textContent = text;
    }

    // 撤销最后一个标注
    undoLastAnnotation() {
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        if (currentAnnotations.length === 0) return;

        const lastAnnotation = currentAnnotations[currentAnnotations.length - 1];
        this.deleteAnnotation(lastAnnotation.id);
    }

    // 清除当前图像标注
    clearCurrentAnnotations() {
        this.annotations = this.annotations.filter(ann => ann.imageIndex !== this.currentImageIndex);

        if (this.uploadedImages[this.currentImageIndex]) {
            this.uploadedImages[this.currentImageIndex].annotations = [];
        }

        this.updateAnnotationList();
        this.redrawAnnotations();
    }

    // 确认所有AI标注
    confirmAllAIAnnotations() {
        const aiAnnotations = this.annotations.filter(ann =>
            ann.imageIndex === this.currentImageIndex && ann.aiSuggested
        );

        if (aiAnnotations.length === 0) {
            this.showNotification('当前图像没有AI标注', 'info');
            return;
        }

        aiAnnotations.forEach(ann => {
            ann.aiSuggested = false;

            if (this.uploadedImages[this.currentImageIndex]) {
                const imgAnnotation = this.uploadedImages[this.currentImageIndex].annotations.find(a => a.id === ann.id);
                if (imgAnnotation) {
                    imgAnnotation.aiSuggested = false;
                }
            }
        });

        this.updateAnnotationList();
        this.redrawAnnotations();
        this.showNotification(`已确认 ${aiAnnotations.length} 个AI标注`, 'success');
    }

    // 清除所有标注
    clearAllAnnotations() {
        this.annotations = [];
        this.uploadedImages.forEach(img => {
            img.annotations = [];
        });

        this.updateAnnotationList();
        this.redrawAnnotations();
        this.showNotification('已清除所有标注', 'info');
    }

    // 导出标注数据
    exportAnnotations() {
        const data = {
            images: this.uploadedImages.map(img => ({
                name: img.name,
                annotations: img.annotations
            })),
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical_annotations_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('标注数据已导出', 'success');
    }

    // 清空所有
    clearAll() {
        document.getElementById('clinicalQuestion').value = '';
        this.uploadedImages = [];
        this.annotations = [];
        this.annotationCounter = 0;
        this.currentImageIndex = 0;

        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('imageWorkspace').style.display = 'none';
        document.getElementById('imageControls').style.display = 'none';
        document.getElementById('analysisSection').style.display = 'none';

        this.updateThumbnails();
        this.updateAnnotationList();

        // 重置分析内容
        document.getElementById('thinkingContent').innerHTML = `
            <div class="modern-analysis-placeholder">
                <i class="fas fa-lightbulb"></i>
                <p>上传图像并开始分析后，AI的思考过程将在此显示</p>
            </div>
        `;
        document.getElementById('answerContent').innerHTML = `
            <div class="modern-analysis-placeholder">
                <i class="fas fa-clipboard-list"></i>
                <p>AI分析完成后，诊断建议和治疗方案将在此显示</p>
            </div>
        `;
        this.updateAnalysisStatus('waiting', '等待分析');
    }
}

// 保留原有的ImageAnnotationSystem类以兼容性
class ImageAnnotationSystem {
    constructor() {
        this.currentTool = 'select';
        this.annotations = [];
        this.annotationCounter = 0;
        this.currentImageIndex = 0;
        this.uploadedImages = [];
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentAnnotation = null;

        this.init();
    }

    init() {
        this.initUpload();
        this.initCanvas();
        this.initToolbar();
        this.initImageControls();
        this.initAnalysis();
    }

    // 初始化图片上传功能
    initUpload() {
        const uploadArea = document.getElementById('annotationUploadArea');
        const uploadInput = document.getElementById('annotationImageInput');
        const uploadBtn = uploadArea?.querySelector('.upload-btn');

        if (!uploadArea || !uploadInput) return;

        // 点击上传
        uploadBtn?.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadArea.addEventListener('click', (e) => {
            if (e.target === uploadArea || e.target.closest('.upload-placeholder')) {
                uploadInput.click();
            }
        });

        // 文件选择
        uploadInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    // 处理文件上传
    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        src: e.target.result,
                        annotations: []
                    };
                    this.uploadedImages.push(imageData);
                    this.updateImageList();

                    // 如果是第一张图片，自动显示
                    if (this.uploadedImages.length === 1) {
                        this.showImage(0);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 更新图片列表显示
    updateImageList() {
        const uploadedImagesDiv = document.getElementById('uploadedImagesList');
        const thumbnailList = document.getElementById('thumbnailList');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');

        if (!uploadedImagesDiv || !thumbnailList) return;

        if (this.uploadedImages.length > 0) {
            uploadPlaceholder.style.display = 'none';
            uploadedImagesDiv.style.display = 'block';

            thumbnailList.innerHTML = this.uploadedImages.map((img, index) => `
                <div class="thumbnail-item ${index === this.currentImageIndex ? 'active' : ''}"
                     data-index="${index}">
                    <img src="${img.src}" alt="${img.name}">
                    <button class="thumbnail-remove" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');

            // 绑定缩略图点击事件
            thumbnailList.querySelectorAll('.thumbnail-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.thumbnail-remove')) {
                        const index = parseInt(item.dataset.index);
                        this.showImage(index);
                    }
                });
            });

            // 绑定删除按钮事件
            thumbnailList.querySelectorAll('.thumbnail-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    this.removeImage(index);
                });
            });
        } else {
            uploadPlaceholder.style.display = 'block';
            uploadedImagesDiv.style.display = 'none';
        }
    }

    // 显示指定图片
    showImage(index) {
        if (index < 0 || index >= this.uploadedImages.length) return;

        this.currentImageIndex = index;
        const imageData = this.uploadedImages[index];
        const currentImage = document.getElementById('currentImage');
        const clinicalDataSection = document.getElementById('clinicalDataSection');
        const imageCounter = document.getElementById('imageCounter');

        if (currentImage && clinicalDataSection) {
            currentImage.src = imageData.src;
            currentImage.style.display = 'block';
            clinicalDataSection.style.display = 'block';

            // 更新图片计数器
            if (imageCounter) {
                imageCounter.textContent = `${index + 1} / ${this.uploadedImages.length}`;
            }

            // 更新缩略图激活状态
            this.updateImageList();

            // 重新初始化canvas
            this.initCanvas();

            // 加载该图片的标注
            this.loadAnnotations(imageData.annotations);
        }
    }

    // 删除图片
    removeImage(index) {
        if (index < 0 || index >= this.uploadedImages.length) return;

        this.uploadedImages.splice(index, 1);

        if (this.uploadedImages.length === 0) {
            // 没有图片了，隐藏显示区域
            const clinicalDataSection = document.getElementById('clinicalDataSection');
            if (clinicalDataSection) {
                clinicalDataSection.style.display = 'none';
            }
            this.currentImageIndex = 0;
        } else {
            // 调整当前图片索引
            if (this.currentImageIndex >= this.uploadedImages.length) {
                this.currentImageIndex = this.uploadedImages.length - 1;
            }
            this.showImage(this.currentImageIndex);
        }

        this.updateImageList();
    }

    // 初始化Canvas
    initCanvas() {
        const canvas = document.getElementById('annotationCanvas');
        const currentImage = document.getElementById('currentImage');

        if (!canvas || !currentImage) return;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 等待图片加载完成后设置canvas尺寸
        currentImage.onload = () => {
            const rect = currentImage.getBoundingClientRect();
            canvas.width = currentImage.offsetWidth;
            canvas.height = currentImage.offsetHeight;
            canvas.style.width = currentImage.offsetWidth + 'px';
            canvas.style.height = currentImage.offsetHeight + 'px';

            // 重绘所有标注
            this.redrawAnnotations();
        };

        // 如果图片已经加载，立即设置尺寸
        if (currentImage.complete) {
            canvas.width = currentImage.offsetWidth;
            canvas.height = currentImage.offsetHeight;
            canvas.style.width = currentImage.offsetWidth + 'px';
            canvas.style.height = currentImage.offsetHeight + 'px';
            this.redrawAnnotations();
        }

        // 绑定鼠标事件
        this.bindCanvasEvents();
    }

    // 绑定Canvas事件
    bindCanvasEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    // 鼠标按下事件
    handleMouseDown(e) {
        if (this.currentTool === 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isDrawing = true;

        if (this.currentTool === 'rectangle') {
            this.currentAnnotation = {
                type: 'rectangle',
                startX: this.startX,
                startY: this.startY,
                endX: this.startX,
                endY: this.startY
            };
        }
    }

    // 鼠标移动事件
    handleMouseMove(e) {
        if (!this.isDrawing || this.currentTool === 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        if (this.currentTool === 'rectangle' && this.currentAnnotation) {
            this.currentAnnotation.endX = currentX;
            this.currentAnnotation.endY = currentY;

            // 重绘canvas
            this.redrawAnnotations();
            this.drawTemporaryAnnotation(this.currentAnnotation);
        }
    }

    // 鼠标释放事件
    handleMouseUp(e) {
        if (!this.isDrawing || this.currentTool === 'select') return;

        this.isDrawing = false;

        if (this.currentAnnotation) {
            // 检查标注是否有效（最小尺寸）
            const minSize = 10;
            const width = Math.abs(this.currentAnnotation.endX - this.currentAnnotation.startX);
            const height = Math.abs(this.currentAnnotation.endY - this.currentAnnotation.startY);

            if (width > minSize && height > minSize) {
                this.addAnnotation(this.currentAnnotation);
            }

            this.currentAnnotation = null;
            this.redrawAnnotations();
        }
    }

    // Canvas点击事件（用于箭头和文本工具）
    handleCanvasClick(e) {
        if (this.currentTool === 'arrow' || this.currentTool === 'text') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const annotation = {
                type: this.currentTool,
                x: x,
                y: y
            };

            if (this.currentTool === 'text') {
                const text = prompt('请输入标注文本：');
                if (text) {
                    annotation.text = text;
                    this.addAnnotation(annotation);
                }
            } else {
                this.addAnnotation(annotation);
            }
        }
    }

    // 添加标注
    addAnnotation(annotation) {
        this.annotationCounter++;
        const annotationData = {
            id: this.annotationCounter,
            ...annotation,
            imageIndex: this.currentImageIndex
        };

        // 添加到当前图片的标注列表
        if (this.uploadedImages[this.currentImageIndex]) {
            this.uploadedImages[this.currentImageIndex].annotations.push(annotationData);
        }

        // 添加到全局标注列表
        this.annotations.push(annotationData);

        // 更新标注列表显示
        this.updateAnnotationList();

        // 重绘canvas
        this.redrawAnnotations();
    }

    // 加载标注
    loadAnnotations(annotations) {
        // 清空当前标注
        this.annotations = this.annotations.filter(ann => ann.imageIndex !== this.currentImageIndex);

        // 加载新标注
        annotations.forEach(ann => {
            this.annotations.push({...ann, imageIndex: this.currentImageIndex});
        });

        this.updateAnnotationList();
        this.redrawAnnotations();
    }

    // 重绘所有标注
    redrawAnnotations() {
        if (!this.ctx) return;

        // 清空canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制当前图片的所有标注
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);

        currentAnnotations.forEach(annotation => {
            this.drawAnnotation(annotation);
        });
    }

    // 绘制单个标注
    drawAnnotation(annotation) {
        if (!this.ctx) return;

        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '14px Arial';

        switch (annotation.type) {
            case 'rectangle':
                const width = annotation.endX - annotation.startX;
                const height = annotation.endY - annotation.startY;
                this.ctx.strokeRect(annotation.startX, annotation.startY, width, height);

                // 绘制标注ID
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(annotation.startX, annotation.startY - 20, 30, 20);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(`#${annotation.id}`, annotation.startX + 5, annotation.startY - 5);
                break;

            case 'arrow':
                // 绘制箭头
                this.ctx.beginPath();
                this.ctx.moveTo(annotation.x - 20, annotation.y - 20);
                this.ctx.lineTo(annotation.x, annotation.y);
                this.ctx.lineTo(annotation.x - 10, annotation.y - 10);
                this.ctx.moveTo(annotation.x, annotation.y);
                this.ctx.lineTo(annotation.x - 10, annotation.y + 10);
                this.ctx.stroke();

                // 绘制标注ID
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(annotation.x - 40, annotation.y - 40, 30, 20);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(`#${annotation.id}`, annotation.x - 35, annotation.y - 25);
                break;

            case 'text':
                // 绘制文本
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText(annotation.text || '', annotation.x, annotation.y);

                // 绘制标注ID背景
                this.ctx.fillRect(annotation.x, annotation.y - 35, 30, 20);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(`#${annotation.id}`, annotation.x + 5, annotation.y - 20);
                break;
        }
    }

    // 绘制临时标注（拖拽过程中）
    drawTemporaryAnnotation(annotation) {
        if (!this.ctx) return;

        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        if (annotation.type === 'rectangle') {
            const width = annotation.endX - annotation.startX;
            const height = annotation.endY - annotation.startY;
            this.ctx.strokeRect(annotation.startX, annotation.startY, width, height);
        }

        this.ctx.setLineDash([]);
    }

    // 更新标注列表显示
    updateAnnotationList() {
        const annotationsContainer = document.getElementById('annotationsContainer');
        if (!annotationsContainer) return;

        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);

        if (currentAnnotations.length === 0) {
            annotationsContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">暂无标注</p>';
            return;
        }

        annotationsContainer.innerHTML = currentAnnotations.map(annotation => {
            let description = '';
            switch (annotation.type) {
                case 'rectangle':
                    description = '矩形标注';
                    break;
                case 'arrow':
                    description = '箭头指向';
                    break;
                case 'text':
                    description = annotation.text || '文本标注';
                    break;
            }

            return `
                <div class="annotation-item" data-id="${annotation.id}">
                    <div class="annotation-info">
                        <span class="annotation-id">#${annotation.id}</span>
                        <span class="annotation-text">${description}</span>
                    </div>
                    <div class="annotation-actions">
                        <button class="annotation-action" onclick="imageAnnotationSystem.highlightAnnotation(${annotation.id})" title="高亮">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="annotation-action" onclick="imageAnnotationSystem.editAnnotation(${annotation.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="annotation-action" onclick="imageAnnotationSystem.deleteAnnotation(${annotation.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定鼠标悬停事件
        annotationsContainer.querySelectorAll('.annotation-item').forEach(item => {
            const id = parseInt(item.dataset.id);

            item.addEventListener('mouseenter', () => {
                this.highlightAnnotation(id);
            });

            item.addEventListener('mouseleave', () => {
                this.unhighlightAnnotation(id);
            });
        });
    }

    // 高亮标注
    highlightAnnotation(id) {
        const annotation = this.annotations.find(ann => ann.id === id);
        if (!annotation) return;

        // 重绘所有标注
        this.redrawAnnotations();

        // 高亮指定标注
        this.ctx.strokeStyle = '#FF5722';
        this.ctx.lineWidth = 3;
        this.drawAnnotation({...annotation, highlighted: true});

        // 高亮列表项
        const listItem = document.querySelector(`[data-id="${id}"]`);
        if (listItem) {
            listItem.classList.add('highlighted');
        }
    }

    // 取消高亮标注
    unhighlightAnnotation(id) {
        this.redrawAnnotations();

        const listItem = document.querySelector(`[data-id="${id}"]`);
        if (listItem) {
            listItem.classList.remove('highlighted');
        }
    }

    // 编辑标注
    editAnnotation(id) {
        const annotation = this.annotations.find(ann => ann.id === id);
        if (!annotation) return;

        if (annotation.type === 'text') {
            const newText = prompt('编辑标注文本：', annotation.text || '');
            if (newText !== null) {
                annotation.text = newText;
                this.updateAnnotationList();
                this.redrawAnnotations();
            }
        }
    }

    // 删除标注
    deleteAnnotation(id) {
        if (confirm('确定要删除这个标注吗？')) {
            // 从全局列表中删除
            this.annotations = this.annotations.filter(ann => ann.id !== id);

            // 从图片标注列表中删除
            if (this.uploadedImages[this.currentImageIndex]) {
                this.uploadedImages[this.currentImageIndex].annotations =
                    this.uploadedImages[this.currentImageIndex].annotations.filter(ann => ann.id !== id);
            }

            this.updateAnnotationList();
            this.redrawAnnotations();
        }
    }

    // 初始化工具栏
    initToolbar() {
        const toolBtns = document.querySelectorAll('.tool-btn');
        const clearBtn = document.getElementById('clearAnnotationsBtn');
        const undoBtn = document.getElementById('undoAnnotationBtn');

        // 工具选择
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;

                // 更新canvas光标
                if (this.canvas) {
                    switch (this.currentTool) {
                        case 'select':
                            this.canvas.style.cursor = 'default';
                            break;
                        case 'rectangle':
                        case 'pen':
                            this.canvas.style.cursor = 'crosshair';
                            break;
                        case 'arrow':
                        case 'text':
                            this.canvas.style.cursor = 'pointer';
                            break;
                    }
                }
            });
        });

        // 清除所有标注
        clearBtn?.addEventListener('click', () => {
            if (confirm('确定要清除当前图片的所有标注吗？')) {
                this.clearCurrentImageAnnotations();
            }
        });

        // 撤销最后一个标注
        undoBtn?.addEventListener('click', () => {
            this.undoLastAnnotation();
        });
    }

    // 清除当前图片的所有标注
    clearCurrentImageAnnotations() {
        // 从全局列表中删除当前图片的标注
        this.annotations = this.annotations.filter(ann => ann.imageIndex !== this.currentImageIndex);

        // 清空当前图片的标注列表
        if (this.uploadedImages[this.currentImageIndex]) {
            this.uploadedImages[this.currentImageIndex].annotations = [];
        }

        this.updateAnnotationList();
        this.redrawAnnotations();
    }

    // 撤销最后一个标注
    undoLastAnnotation() {
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        if (currentAnnotations.length === 0) return;

        const lastAnnotation = currentAnnotations[currentAnnotations.length - 1];
        this.deleteAnnotation(lastAnnotation.id);
    }

    // 初始化图片控制
    initImageControls() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');

        prevBtn?.addEventListener('click', () => {
            if (this.currentImageIndex > 0) {
                this.showImage(this.currentImageIndex - 1);
            }
        });

        nextBtn?.addEventListener('click', () => {
            if (this.currentImageIndex < this.uploadedImages.length - 1) {
                this.showImage(this.currentImageIndex + 1);
            }
        });

        // 更新按钮状态
        this.updateImageControls();
    }

    // 更新图片控制按钮状态
    updateImageControls() {
        const prevBtn = document.getElementById('prevImageBtn');
        const nextBtn = document.getElementById('nextImageBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentImageIndex <= 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentImageIndex >= this.uploadedImages.length - 1;
        }
    }

    // 初始化AI分析功能
    initAnalysis() {
        const startAnalysisBtn = document.getElementById('startAnalysisBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');

        startAnalysisBtn?.addEventListener('click', () => {
            this.startAIAnalysis();
        });

        clearInputBtn?.addEventListener('click', () => {
            this.clearInput();
        });
    }

    // 开始AI分析
    startAIAnalysis() {
        const clinicalQuestion = document.getElementById('clinicalQuestion')?.value;
        const thinkingContent = document.getElementById('thinkingContent');
        const answerContent = document.getElementById('answerContent');
        const thinkingStatus = document.getElementById('thinkingStatus');

        if (!clinicalQuestion.trim() && this.uploadedImages.length === 0) {
            alert('请输入临床问题或上传图像后再开始分析');
            return;
        }

        // 更新状态
        if (thinkingStatus) {
            thinkingStatus.innerHTML = '<span class="status-text status-loading">AI分析中...</span><div class="loading-spinner"></div>';
        }

        // 模拟AI分析过程
        this.simulateAIAnalysis(clinicalQuestion, thinkingContent, answerContent, thinkingStatus);
    }

    // 模拟AI分析过程
    simulateAIAnalysis(question, thinkingContent, answerContent, statusElement) {
        // 清空之前的内容
        if (thinkingContent) {
            thinkingContent.innerHTML = '<div class="thinking-placeholder"><i class="fas fa-spinner fa-spin"></i><p>AI正在分析中...</p></div>';
        }
        if (answerContent) {
            answerContent.innerHTML = '<div class="answer-placeholder"><i class="fas fa-spinner fa-spin"></i><p>等待分析完成...</p></div>';
        }

        // 模拟分析延迟
        setTimeout(() => {
            this.generateAIResponse(question, thinkingContent, answerContent, statusElement);
        }, 2000);
    }

    // 生成AI响应
    generateAIResponse(question, thinkingContent, answerContent, statusElement) {
        // 更新状态
        if (statusElement) {
            statusElement.innerHTML = '<span class="status-text status-complete">分析完成</span>';
        }

        // 生成思考内容
        const thinkingText = this.generateThinkingContent(question);
        if (thinkingContent) {
            thinkingContent.innerHTML = `<div class="text-editor" contenteditable="true">${thinkingText}</div>`;
        }

        // 生成回答内容
        const answerText = this.generateAnswerContent(question);
        if (answerContent) {
            answerContent.innerHTML = `<div class="text-editor" contenteditable="true">${answerText}</div>`;
        }

        // 启用标注引用功能
        this.enableAnnotationReferences();
    }

    // 生成思考内容
    generateThinkingContent(question) {
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        let content = `<p><strong>临床问题分析：</strong></p>`;
        content += `<p>根据患者描述：${question || '未提供具体症状描述'}</p>`;

        if (this.uploadedImages.length > 0) {
            content += `<p><strong>影像学分析：</strong></p>`;
            content += `<p>已上传 ${this.uploadedImages.length} 张医学图像进行分析。</p>`;

            if (currentAnnotations.length > 0) {
                content += `<p>当前图像发现 ${currentAnnotations.length} 个关键特征：</p><ul>`;
                currentAnnotations.forEach(ann => {
                    let desc = '';
                    switch (ann.type) {
                        case 'rectangle':
                            desc = '框选区域显示异常密度改变';
                            break;
                        case 'arrow':
                            desc = '箭头指向的结构需要重点关注';
                            break;
                        case 'text':
                            desc = ann.text || '文本标注区域';
                            break;
                    }
                    content += `<li><span class="annotation-reference" data-id="${ann.id}">[影像-标注#${ann.id}]</span> ${desc}</li>`;
                });
                content += `</ul>`;
            }
        }

        content += `<p><strong>初步判断：</strong></p>`;
        content += `<p>基于现有信息，建议进一步检查以明确诊断。需要结合患者病史、体格检查及其他辅助检查结果综合判断。</p>`;

        return content;
    }

    // 生成回答内容
    generateAnswerContent(question) {
        const currentAnnotations = this.annotations.filter(ann => ann.imageIndex === this.currentImageIndex);
        let content = `<p><strong>诊断建议：</strong></p>`;

        if (currentAnnotations.length > 0) {
            content += `<p>根据影像学表现，特别是标注的关键区域：</p><ul>`;
            currentAnnotations.forEach(ann => {
                content += `<li><span class="annotation-reference" data-id="${ann.id}">[影像-标注#${ann.id}]</span> 区域的特征提示需要进一步评估</li>`;
            });
            content += `</ul>`;
        }

        content += `<p><strong>建议：</strong></p>`;
        content += `<ul>`;
        content += `<li>建议结合临床症状和体征进行综合判断</li>`;
        content += `<li>如有必要，可考虑进一步影像学检查</li>`;
        content += `<li>建议专科医师会诊</li>`;
        content += `<li>定期随访观察病情变化</li>`;
        content += `</ul>`;

        content += `<p><strong>注意事项：</strong></p>`;
        content += `<p>本分析仅供参考，最终诊断需要结合完整的临床资料由专业医师做出。</p>`;

        return content;
    }

    // 启用标注引用功能
    enableAnnotationReferences() {
        const references = document.querySelectorAll('.annotation-reference');

        references.forEach(ref => {
            const annotationId = parseInt(ref.dataset.id);

            ref.addEventListener('mouseenter', () => {
                this.highlightAnnotation(annotationId);
                ref.classList.add('highlighted');
            });

            ref.addEventListener('mouseleave', () => {
                this.unhighlightAnnotation(annotationId);
                ref.classList.remove('highlighted');
            });

            ref.addEventListener('click', () => {
                this.highlightAnnotation(annotationId);
                // 滚动到对应的标注列表项
                const listItem = document.querySelector(`[data-id="${annotationId}"]`);
                if (listItem) {
                    listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    // 清空输入
    clearInput() {
        if (confirm('确定要清空所有输入内容吗？')) {
            const clinicalQuestion = document.getElementById('clinicalQuestion');
            const thinkingContent = document.getElementById('thinkingContent');
            const answerContent = document.getElementById('answerContent');
            const thinkingStatus = document.getElementById('thinkingStatus');

            if (clinicalQuestion) clinicalQuestion.value = '';

            if (thinkingContent) {
                thinkingContent.innerHTML = '<div class="thinking-placeholder"><i class="fas fa-lightbulb"></i><p>请上传图像并点击"开始AI分析"来查看AI的思考过程</p></div>';
            }

            if (answerContent) {
                answerContent.innerHTML = '<div class="answer-placeholder"><i class="fas fa-stethoscope"></i><p>AI分析完成后，诊断建议将在此显示</p></div>';
            }

            if (thinkingStatus) {
                thinkingStatus.innerHTML = '<span class="status-text">等待分析...</span>';
            }

            // 清空图片和标注
            this.uploadedImages = [];
            this.annotations = [];
            this.annotationCounter = 0;
            this.currentImageIndex = 0;

            this.updateImageList();

            const clinicalDataSection = document.getElementById('clinicalDataSection');
            if (clinicalDataSection) {
                clinicalDataSection.style.display = 'none';
            }
        }
    }
}

// 初始化现代化医学AI图像标注系统
let modernMedicalAI;

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在图像分析页面
    const imageAnalysisPage = document.getElementById('image-analysis-page');
    if (imageAnalysisPage) {
        modernMedicalAI = new ModernMedicalAIAnnotationSystem();
    }
});

// 保留原有的图像标注系统以兼容性
let imageAnnotationSystem;
if (document.getElementById('image-analysis-page')) {
    imageAnnotationSystem = new ImageAnnotationSystem();
}
