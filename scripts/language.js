(() => {
  const labels = {
    en: { Home:'Home', Explore:'Explore', 'How It Works':'How It Works', 'For Developers':'For Developers', Pricing:'Pricing', 'Log In':'Log In', 'Get Started':'Get Started', 'Try Demo':'Try Demo', 'Try the workspace':'Try the workspace', 'For Testers':'For Testers', 'For developers':'For developers', 'Open the preview':'Open the preview', 'Try the demo workspace':'Try the demo workspace', 'Sign up':'Sign up', 'View sign up':'View sign up', 'Already have an account?':'Already have an account?', 'New to FIRSTWAVE?':'New to FIRSTWAVE?', 'Maker workspace':'Maker workspace', 'Tester workspace':'Tester workspace', Overview:'Overview', 'My Projects':'My Projects', Applications:'Applications', Feedback:'Feedback', Analytics:'Analytics', Settings:'Settings', 'My tester applications':'My tester applications', 'Received applications':'Received applications', 'No projects yet':'No projects yet', 'Create a project':'Create a project', 'No applications sent':'No applications sent', 'No applicants yet':'No applicants yet', 'Clear local projects':'Clear local projects', 'Local preview':'Local preview', 'Log out':'Log out', 'Log in':'Log in', 'Create account':'Create account', 'Post to community':'Post to community', 'Start a conversation':'Start a conversation', Community:'Community', 'Where Great Apps':'Where Great Apps', 'Meet Their Users.':'Meet Their Users.', 'Connect with passionate beta testers who help you validate, improve, and launch better products.':'Connect with passionate beta testers who help you validate, improve, and launch better products.', 'Better products begin with':'Better products begin with', 'real people.':'real people.', 'Share what you are building, ask for testing help, and learn from other members.':'Share what you are building, ask for testing help, and learn from other members.', 'What would you like to discuss?':'What would you like to discuss?', 'Give the community enough context to respond.':'Give the community enough context to respond.', 'Product showcase':'Product showcase', 'Testing help':'Testing help', Question:'Question', Discussion:'Discussion', 'Recent projects':'Recent projects', 'Your campaigns':'Your campaigns', 'Applications received':'Applications received', 'Selected testers':'Selected testers', 'Feedback received':'Feedback received', 'Build. Launch. Test. Improve.':'Build. Launch. Test. Improve.' },
    ko: { Home:'홈', Explore:'탐색', 'How It Works':'이용 방법', 'For Developers':'개발자', Pricing:'요금 안내', 'Log In':'로그인', 'Get Started':'시작하기', 'Try Demo':'데모 체험', 'Try the workspace':'워크스페이스 열기', 'For Testers':'테스터', 'For developers':'개발자', 'Open the preview':'미리보기 열기', 'Try the demo workspace':'데모 워크스페이스 체험', 'Sign up':'회원가입', 'View sign up':'회원가입 보기', 'Already have an account?':'이미 계정이 있나요?', 'New to FIRSTWAVE?':'FIRSTWAVE가 처음이신가요?', 'Maker workspace':'개발자 워크스페이스', 'Tester workspace':'테스터 워크스페이스', Overview:'개요', 'My Projects':'내 프로젝트', Applications:'지원 현황', Feedback:'피드백', Analytics:'분석', Settings:'설정', 'My tester applications':'내 테스터 지원', 'Received applications':'받은 지원', 'No projects yet':'프로젝트가 없습니다', 'Create a project':'프로젝트 만들기', 'No applications sent':'지원한 프로젝트가 없습니다', 'No applicants yet':'아직 지원자가 없습니다', 'Clear local projects':'로컬 프로젝트 비우기', 'Local preview':'로컬 미리보기', 'Log out':'로그아웃', 'Log in':'로그인', 'Create account':'계정 만들기', 'Post to community':'커뮤니티에 게시', 'Start a conversation':'대화 시작하기', Community:'커뮤니티', 'Where Great Apps':'멋진 앱이', 'Meet Their Users.':'사용자를 만나는 곳', 'Connect with passionate beta testers who help you validate, improve, and launch better products.':'열정적인 베타 테스터와 함께 제품을 검증하고 개선해 더 나은 출시를 준비하세요.', 'Better products begin with':'더 나은 제품은', 'real people.':'실제 사용자에게서 시작됩니다.', 'Share what you are building, ask for testing help, and learn from other members.':'만들고 있는 제품을 소개하고 테스트 도움을 구하며 다른 멤버와 배워보세요.', 'What would you like to discuss?':'어떤 이야기를 나누고 싶으신가요?', 'Give the community enough context to respond.':'커뮤니티가 답할 수 있도록 상황을 자세히 적어주세요.', 'Product showcase':'제품 소개', 'Testing help':'테스트 도움', Question:'질문', Discussion:'토론', 'Recent projects':'최근 프로젝트', 'Your campaigns':'내 캠페인', 'Applications received':'받은 지원', 'Selected testers':'선정된 테스터', 'Feedback received':'받은 피드백', 'Build. Launch. Test. Improve.':'만들고, 출시하고, 테스트하고, 개선하세요.' }
  };
  let language = 'en';
  try { language = localStorage.getItem('firstwave-language') === 'ko' ? 'ko' : 'en'; } catch {}
  function translate(next) {
    language = next;
    document.documentElement.lang = language;
    const dictionary = labels[language];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue || '', key = raw.trim();
      if (labels.en[key]) node.nodeValue = raw.replace(key, dictionary[key] || key);
      else if (language === 'en') {
        const korean = Object.entries(labels.ko).find(([, value]) => value === key)?.[0];
        if (korean) node.nodeValue = raw.replace(key, korean);
      }
    }
    document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element => {
      for (const attr of ['placeholder','aria-label','title']) {
        const value = element.getAttribute(attr); if (!value) continue;
        if (dictionary[value]) element.setAttribute(attr, dictionary[value]);
        else if (language === 'en') { const english = Object.entries(labels.ko).find(([, ko]) => ko === value)?.[0]; if (english) element.setAttribute(attr, english); }
      }
    });
    const button = document.querySelector('[data-language-toggle]');
    if (button) {
      const label = language === 'en' ? '한국어' : 'English';
      const accessibleLabel = language === 'en' ? '한국어로 보기' : 'View in English';
      if (button.textContent !== label) button.textContent = label;
      if (button.getAttribute('aria-label') !== accessibleLabel) button.setAttribute('aria-label', accessibleLabel);
    }
    try { localStorage.setItem('firstwave-language', language); } catch {}
  }
  function mount() {
    const header = document.querySelector('.site-header, .demo-global');
    if (!header || header.querySelector('[data-language-toggle]')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'language-toggle'; button.dataset.languageToggle = '';
    button.addEventListener('click', () => translate(language === 'en' ? 'ko' : 'en'));
    header.append(button);
    translate(language);
    new MutationObserver(records => { if (records.some(record => record.type === 'childList')) window.setTimeout(() => translate(language), 0); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
