// 医学AI模型评分系统JavaScript
class MedicalAIScoringSystem {
    constructor() {
        this.scores = {
            accuracy: 0,
            completeness: 0,
            relevance: 0,
            readability: 0,
            safety: 0
        };

        this.comments = {
            accuracy: '',
            completeness: '',
            relevance: '',
            readability: '',
            safety: '',
            overall: ''
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateEvaluationTime();
        this.initializeAnimations();
    }

    bindEvents() {
        // 评分选择事件
        document.querySelectorAll('#model-scoring-page input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', this.handleScoreChange.bind(this));
        });

        // 评论输入事件
        document.querySelectorAll('#model-scoring-page .comment-input').forEach(textarea => {
            textarea.addEventListener('input', this.handleCommentChange.bind(this));
        });

        const overallComment = document.getElementById('overallComment');
        if (overallComment) {
            overallComment.addEventListener('input', this.handleOverallCommentChange.bind(this));
        }

        // 按钮事件
        const previewBtn = document.getElementById('previewScoreBtn');
        const submitBtn = document.getElementById('submitScoreBtn');
        const resetBtn = document.getElementById('resetScoreBtn');
        const scoringForm = document.getElementById('modelScoringForm');

        if (previewBtn) previewBtn.addEventListener('click', this.previewScores.bind(this));
        if (submitBtn) submitBtn.addEventListener('click', this.submitScores.bind(this));
        if (resetBtn) resetBtn.addEventListener('click', this.resetForm.bind(this));
        if (scoringForm) scoringForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    updateEvaluationTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('evaluationTime').textContent = timeString;
    }

    initializeAnimations() {
        // 为评分项添加渐入动画
        const scoringItems = document.querySelectorAll('.scoring-item');
        scoringItems.forEach((item, index) => {
            item.style.animationDelay = `${(index + 1) * 0.1}s`;
        });
    }

    handleScoreChange(event) {
        const dimension = event.target.name;
        const score = parseInt(event.target.value);

        this.scores[dimension] = score;

        // 检查准确性一票否决
        if (dimension === 'accuracy') {
            this.checkAccuracyVeto(score);
        }

        // 更新评分预览
        this.updateScorePreview();

        // 添加视觉反馈
        this.addScoreAnimation(event.target);
    }

    checkAccuracyVeto(accuracyScore) {
        const vetoWarning = document.querySelector('.veto-warning');

        if (accuracyScore <= 2) {
            if (!vetoWarning) {
                this.createVetoWarning();
            } else {
                vetoWarning.classList.add('show');
            }
        } else {
            if (vetoWarning) {
                vetoWarning.classList.remove('show');
            }
        }
    }

    createVetoWarning() {
        const accuracySection = document.querySelector('.scoring-item.critical');
        const warning = document.createElement('div');
        warning.className = 'veto-warning show';
        warning.innerHTML = `
            <strong>⚠️ 一票否决警告</strong><br>
            准确性评分过低可能导致整体评估不合格，请仔细核实医学内容的正确性。
        `;
        accuracySection.appendChild(warning);
    }

    addScoreAnimation(radioElement) {
        const label = radioElement.nextElementSibling;
        label.style.transform = 'scale(1.05)';
        setTimeout(() => {
            label.style.transform = '';
        }, 200);
    }

    handleCommentChange(event) {
        const textarea = event.target;
        const scoringItem = textarea.closest('.scoring-item');
        const dimension = this.getDimensionFromScoringItem(scoringItem);

        if (dimension) {
            this.comments[dimension] = textarea.value;
        }
    }

    handleOverallCommentChange(event) {
        this.comments.overall = event.target.value;
    }

    getDimensionFromScoringItem(scoringItem) {
        const radioInputs = scoringItem.querySelectorAll('input[type="radio"]');
        if (radioInputs.length > 0) {
            return radioInputs[0].name;
        }
        return null;
    }

    previewScores() {
        if (!this.validateScores()) {
            this.showNotification('请完成所有维度的评分', 'warning');
            return;
        }

        this.updateScorePreview();
        this.showScorePreview();

        // 滚动到预览区域
        const previewSection = document.getElementById('scorePreviewSection');
        if (previewSection) {
            previewSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateScorePreview() {
        // 更新各维度分数
        Object.keys(this.scores).forEach(dimension => {
            const score = this.scores[dimension];
            const scoreElement = document.getElementById(`${dimension}Score`);
            const fillElement = document.querySelector(`[data-dimension="${dimension}"]`);

            if (scoreElement && score > 0) {
                scoreElement.textContent = score;
                if (fillElement) {
                    fillElement.style.width = `${(score / 5) * 100}%`;
                }
            }
        });

        // 计算总分
        const totalScore = this.calculateOverallScore();
        const overallScoreElement = document.getElementById('overallScoreValue');
        const scoreLevelElement = document.getElementById('scoreLevel');

        if (overallScoreElement) {
            overallScoreElement.textContent = totalScore.toFixed(1);
        }

        if (scoreLevelElement) {
            const level = this.getScoreLevel(totalScore);
            scoreLevelElement.textContent = level.text;
            scoreLevelElement.className = `score-level ${level.class}`;
        }
    }

    calculateOverallScore() {
        const scores = Object.values(this.scores).filter(score => score > 0);
        if (scores.length === 0) return 0;

        // 准确性权重更高
        const weights = {
            accuracy: 0.3,
            completeness: 0.2,
            relevance: 0.2,
            readability: 0.15,
            safety: 0.15
        };

        let weightedSum = 0;
        let totalWeight = 0;

        Object.keys(this.scores).forEach(dimension => {
            if (this.scores[dimension] > 0) {
                weightedSum += this.scores[dimension] * weights[dimension];
                totalWeight += weights[dimension];
            }
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    getScoreLevel(score) {
        if (score >= 4.5) return { text: '优秀', class: 'excellent' };
        if (score >= 3.5) return { text: '良好', class: 'good' };
        if (score >= 2.5) return { text: '合格', class: 'average' };
        if (score >= 1.5) return { text: '欠佳', class: 'poor' };
        return { text: '差', class: 'poor' };
    }

    showScorePreview() {
        const previewSection = document.getElementById('scorePreviewSection');
        if (previewSection) {
            previewSection.style.display = 'block';
        }
    }

    validateScores() {
        return Object.values(this.scores).every(score => score > 0);
    }

    handleFormSubmit(event) {
        event.preventDefault();
        this.submitScores();
    }

    submitScores() {
        if (!this.validateScores()) {
            this.showNotification('请完成所有维度的评分', 'error');
            return;
        }

        if (!this.validateComments()) {
            this.showNotification('请为每个维度提供评分理由', 'warning');
            return;
        }

        // 检查准确性一票否决
        if (this.scores.accuracy <= 2) {
            const confirmed = confirm('准确性评分较低，确定要提交吗？这可能影响整体评估结果。');
            if (!confirmed) return;
        }

        this.showLoadingState();

        // 模拟提交过程
        setTimeout(() => {
            this.processSubmission();
        }, 2000);
    }

    validateComments() {
        // 检查是否所有维度都有评论
        const requiredComments = ['accuracy', 'completeness', 'relevance', 'readability', 'safety'];
        return requiredComments.every(dimension =>
            this.comments[dimension] && this.comments[dimension].trim().length > 0
        );
    }

    showLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = '提交中...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    }

    hideLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.textContent = '提交评分';
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }

    processSubmission() {
        const submissionData = this.collectSubmissionData();

        // 模拟API调用
        console.log('提交的评分数据：', submissionData);

        this.hideLoadingState();
        this.showNotification('评分提交成功！', 'success');

        // 可以在这里添加实际的API调用
        // this.sendToAPI(submissionData);

        // 显示提交成功的详细信息
        this.showSubmissionSuccess(submissionData);
    }

    collectSubmissionData() {
        return {
            caseId: document.getElementById('caseId').textContent,
            imageType: document.getElementById('imageType').textContent,
            aiModel: document.getElementById('aiModel').textContent,
            evaluationTime: document.getElementById('evaluationTime').textContent,
            scores: { ...this.scores },
            comments: { ...this.comments },
            overallScore: this.calculateOverallScore(),
            scoreLevel: this.getScoreLevel(this.calculateOverallScore()),
            timestamp: new Date().toISOString(),
            evaluatorId: 'EXPERT-001' // 实际应用中应该从用户会话获取
        };
    }

    showSubmissionSuccess(data) {
        const successMessage = `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4>✅ 评分提交成功</h4>
                <p><strong>案例ID:</strong> ${data.caseId}</p>
                <p><strong>总分:</strong> ${data.overallScore.toFixed(1)} (${data.scoreLevel.text})</p>
                <p><strong>提交时间:</strong> ${new Date(data.timestamp).toLocaleString('zh-CN')}</p>
            </div>
        `;

        const submitSection = document.querySelector('.submit-section');
        submitSection.insertAdjacentHTML('afterend', successMessage);
    }

    resetForm() {
        const confirmed = confirm('确定要重置表单吗？所有评分和评论将被清除。');
        if (!confirmed) return;

        // 重置评分
        this.scores = {
            accuracy: 0,
            completeness: 0,
            relevance: 0,
            readability: 0,
            safety: 0
        };

        // 重置评论
        this.comments = {
            accuracy: '',
            completeness: '',
            relevance: '',
            readability: '',
            safety: '',
            overall: ''
        };

        // 重置表单元素
        document.getElementById('scoringForm').reset();

        // 隐藏预览区域
        document.getElementById('scorePreview').style.display = 'none';

        // 移除警告信息
        const vetoWarning = document.querySelector('.veto-warning');
        if (vetoWarning) {
            vetoWarning.classList.remove('show');
        }

        // 移除成功信息
        const successMessages = document.querySelectorAll('[style*="background: #d4edda"]');
        successMessages.forEach(msg => msg.remove());

        this.showNotification('表单已重置', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化系统
document.addEventListener('DOMContentLoaded', () => {
    new MedicalAIScoringSystem();
});
