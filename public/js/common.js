function showAlert(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = message;
    const myModal = new bootstrap.Modal(document.getElementById('careMateModal'));
    myModal.show();
}

// 사용 예시:
// if (error) showAlert('⚠️ 오류 발생', '데이터 저장에 실패했습니다.');