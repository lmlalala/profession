/**
 * exam.js — 面试题试卷交互逻辑
 * 功能：作答输入、显示/隐藏答案、全部展开答案
 */

function initExam() {
  // 为每道题的「查看答案」按钮绑定事件
  document.querySelectorAll('.q-toggle-answer').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.closest('.q-card').querySelector('.q-answer');
      if (!answer) return;
      const isHidden = answer.style.display === 'none' || !answer.style.display;
      answer.style.display = isHidden ? 'block' : 'none';
      btn.textContent = isHidden ? '▲ 收起答案' : '▼ 查看答案';
    });
  });

  // 底部「查看所有标准答案」按钮
  const showAllBtn = document.getElementById('showAllAnswers');
  if (showAllBtn) {
    let allVisible = false;
    showAllBtn.addEventListener('click', () => {
      allVisible = !allVisible;
      document.querySelectorAll('.q-answer').forEach((el) => {
        el.style.display = allVisible ? 'block' : 'none';
      });
      document.querySelectorAll('.q-toggle-answer').forEach((btn) => {
        btn.textContent = allVisible ? '▲ 收起答案' : '▼ 查看答案';
      });
      showAllBtn.textContent = allVisible ? '🔒 收起所有答案' : '📖 查看所有标准答案';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExam);
} else {
  initExam();
}
