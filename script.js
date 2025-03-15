class SchoolMealApp {
    constructor() {
        this.currentDate = new Date();
        this.mealsContainer = document.getElementById('mealsContainer');
        this.currentDateElement = document.getElementById('currentDate');
        
        // 이벤트 리스너 설정
        document.getElementById('prevWeek').addEventListener('click', () => this.changeWeek(-7));
        document.getElementById('nextWeek').addEventListener('click', () => this.changeWeek(7));
        
        // 초기 데이터 로드
        this.loadWeekMeals();
    }

    async loadWeekMeals() {
        this.mealsContainer.innerHTML = '로딩 중...';
        this.updateDateDisplay();

        const weekMeals = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentDate);
            date.setDate(date.getDate() + i);
            const formattedDate = this.formatDate(date);
            
            try {
                const response = await this.fetchMealData(formattedDate);
                weekMeals.push({
                    date: date,
                    meals: response
                });
            } catch (error) {
                console.error('급식 정보를 가져오는데 실패했습니다:', error);
            }
        }

        this.renderMeals(weekMeals);
    }

    async fetchMealData(date) {
        const url = `	https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=T10&SD_SCHUL_CODE=9171012&MLSV_YMD=${date}`;
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        // XML 파싱 및 데이터 추출
        const meals = xmlDoc.getElementsByTagName('DDISH_NM');
        return meals.length > 0 ? meals[0].textContent : '급식 정보가 없습니다.';
    }

    renderMeals(weekMeals) {
        this.mealsContainer.innerHTML = '';
        
        weekMeals.forEach(({date, meals}) => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dateString = `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
            
            card.innerHTML = `
                <div class="meal-date">${dateString}</div>
                <ul class="meal-items">
                    ${meals.split('<br/>').map(item => `<li>${item.trim()}</li>`).join('')}
                </ul>
            `;
            
            this.mealsContainer.appendChild(card);
        });
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    updateDateDisplay() {
        const endDate = new Date(this.currentDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const formatDateString = (date) => {
            return `${date.getMonth() + 1}월 ${date.getDate()}일`;
        };
        
        this.currentDateElement.textContent = 
            `${formatDateString(this.currentDate)} - ${formatDateString(endDate)}`;
    }

    changeWeek(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.loadWeekMeals();
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SchoolMealApp();
});
