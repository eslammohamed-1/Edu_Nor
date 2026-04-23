<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppBadge from '@/components/common/AppBadge.vue';

const features = [
  {
    title: 'تعلم ذكي',
    desc: 'نستخدم تقنيات الذكاء الاصطناعي لتخصيص المحتوى لكل طالب.',
    icon: 'Brain',
    color: 'var(--color-gold)'
  },
  {
    title: 'أسئلة تفاعلية',
    desc: 'أكثر من 13 نوعاً من الأسئلة الممتعة والشيقة.',
    icon: 'Zap',
    color: 'var(--color-teal)'
  },
  {
    title: 'محتوى معتمد',
    desc: 'جميع المناهج مطابقة للمعايير التعليمية الرسمية.',
    icon: 'ShieldCheck',
    color: 'var(--color-navy)'
  }
];

const stages = [
  { name: 'الابتدائي', icon: 'Sun', color: 'var(--color-gold)', count: '6 سنوات دراسية' },
  { name: 'الإعدادي', icon: 'Cloud', color: 'var(--color-info)', count: '3 سنوات دراسية' },
  { name: 'الثانوي', icon: 'Star', color: 'var(--color-navy)', count: '3 سنوات دراسية' }
];

const stats = [
  { label: 'طالب مشترك', value: '+50,000', icon: 'Users' },
  { label: 'سؤال تفاعلي', value: '+10,000', icon: 'HelpCircle' },
  { label: 'كورس تعليمي', value: '+500', icon: 'PlayCircle' },
  { label: 'تقييم إيجابي', value: '4.9/5', icon: 'Star' }
];
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <header class="hero-section">
      <div class="container hero-container">
        <div class="hero-content animate-slide-up">
          <AppBadge variant="teal" class="mb-sm">المنصة التعليمية الأولى في مصر 🇪🇬</AppBadge>
          <h1 class="text-navy mb-md">
            رحلة تعلم <span class="text-gold">ذكية</span><br />
            لمستقبل أكثر <span class="text-teal">إشراقاً</span>
          </h1>
          <p class="text-body-lg text-secondary mb-xl max-w-sm">
            إديو نور تساعد الطلاب في المراحل الابتدائية والإعدادية والثانوية على فهم المناهج بعمق بدلاً من الحفظ.
          </p>
          <div class="flex gap-md">
            <AppButton size="lg">ابدأ رحلتك الآن</AppButton>
            <AppButton variant="secondary" size="lg">اكتشف المواد</AppButton>
          </div>
        </div>
        <div class="hero-image animate-fade-in">
          <img src="/images/hero_illustration.png" alt="EduNor Student" />
          <div class="floating-card c1 shadow-lg">
            <AppIcon name="TrendingUp" color="var(--color-success)" />
            <span>+85% تقدم سريع</span>
          </div>
          <div class="floating-card c2 shadow-lg">
            <AppIcon name="Award" color="var(--color-gold)" />
            <span>متفوق الأسبوع</span>
          </div>
        </div>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="var(--bg-section)" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </div>
    </header>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <div class="stat-icon-bg">
              <AppIcon :name="stat.icon" :size="32" color="var(--color-gold)" />
            </div>
            <div class="stat-info">
              <h3 class="stat-value font-en">{{ stat.value }}</h3>
              <p class="stat-label text-muted">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section bg-section">
      <div class="container text-center">
        <h2 class="text-navy mb-sm">لماذا تختار إديو نور؟</h2>
        <p class="text-secondary mb-2xl max-w-sm mx-auto">
          نحن نقدم تجربة تعليمية فريدة تجمع بين المتعة والفاعلية العلمية.
        </p>
        <div class="features-grid">
          <AppCard v-for="f in features" :key="f.title" hoverable class="feature-card">
            <div class="feature-icon" :style="{ backgroundColor: f.color + '15' }">
              <AppIcon :name="f.icon" :size="40" :color="f.color" />
            </div>
            <h3 class="mb-sm text-navy">{{ f.title }}</h3>
            <p class="text-secondary text-body-sm">{{ f.desc }}</p>
          </AppCard>
        </div>
      </div>
    </section>

    <!-- Stages Section -->
    <section class="stages-section">
      <div class="container text-center">
        <h2 class="text-navy mb-sm">المراحل الدراسية</h2>
        <p class="text-secondary mb-2xl max-w-sm mx-auto">جميع المناهج مغطاة من الصف الأول الابتدائي حتى الثالث الثانوي.</p>
        <div class="stages-grid">
          <div v-for="s in stages" :key="s.name" class="stage-item transition-all" :style="{ '--stage-color': s.color }">
            <div class="stage-icon">
              <AppIcon :name="s.icon" :size="48" color="var(--stage-color)" />
            </div>
            <h3 class="text-navy">{{ s.name }}</h3>
            <p class="text-muted">{{ s.count }}</p>
            <AppButton variant="ghost" size="sm" class="mt-md">عرض المواد</AppButton>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card shadow-xl">
          <div class="cta-content">
            <h2 class="text-white mb-md">هل أنت مستعد للتفوق؟</h2>
            <p class="text-gray-300 mb-lg">انضم إلى آلاف الطلاب الذين غيروا طريقة تعلمهم مع إديو نور.</p>
            <AppButton size="lg" class="cta-btn">سجل الآن مجاناً</AppButton>
          </div>
          <div class="cta-decoration">
            <AppIcon name="Sparkles" :size="120" color="rgba(244, 168, 37, 0.2)" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  padding-top: var(--space-3xl);
  background: linear-gradient(180deg, #FFFFFF 0%, var(--bg-section) 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: center;
  gap: var(--space-2xl);
  padding-bottom: var(--space-4xl);
}

.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.1;
}

.hero-image {
  position: relative;
}

.hero-image img {
  width: 100%;
  border-radius: var(--radius-xl);
  filter: drop-shadow(0 20px 50px rgba(30, 58, 95, 0.15));
}

.floating-card {
  position: absolute;
  background-color: var(--bg-card);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: var(--weight-semibold);
  font-size: var(--text-body-sm);
  animation: float 4s ease-in-out infinite;
}

.c1 { top: 20%; left: -10%; animation-delay: 0s; }
.c2 { bottom: 20%; right: -5%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  line-height: 0;
}

/* Stats Section */
.stats-section {
  padding: var(--space-2xl) 0;
  background-color: var(--bg-section);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-icon-bg {
  width: 60px;
  height: 60px;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: var(--text-h2);
  color: var(--color-navy);
}

/* Features Section */
.features-section {
  padding: var(--space-4xl) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-xl);
}

.feature-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

/* Stages Section */
.stages-section {
  padding: var(--space-4xl) 0;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-2xl);
}

.stage-item {
  padding: var(--space-2xl);
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border-bottom: 5px solid var(--stage-color);
}

.stage-item:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.stage-icon {
  margin-bottom: var(--space-md);
}

/* CTA Section */
.cta-section {
  padding: var(--space-4xl) 0;
}

.cta-card {
  background: linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-dark) 100%);
  border-radius: var(--radius-2xl);
  padding: var(--space-3xl);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.cta-decoration {
  position: absolute;
  right: -20px;
  top: -20px;
  z-index: 1;
}

.cta-btn {
  background-color: var(--color-gold);
  color: var(--color-navy);
}

/* Responsive */
@media (max-width: 992px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-content h1 { font-size: 2.5rem; }
  .hero-content { display: flex; flex-direction: column; align-items: center; }
  .hero-image { order: -1; max-width: 500px; margin: 0 auto; }
}

.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
.mb-xl { margin-bottom: var(--space-xl); }
.mb-2xl { margin-bottom: var(--space-2xl); }
.max-w-sm { max-width: 450px; }
.mx-auto { margin-inline: auto; }
.mt-md { margin-top: var(--space-md); }
</style>
