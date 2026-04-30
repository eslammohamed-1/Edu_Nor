<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User, UserRole } from '@/types/auth';
import { PERMISSIONS } from '@/lib/permissions';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { validatePasswordAgainstPolicy } from '@/lib/passwordPolicy';

const props = defineProps<{
  open: boolean;
  editUser?: User | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: Partial<User> & { password?: string }];
}>();

const settingsStore = useAdminSettingsStore();

const form = ref({ name: '', email: '', password: '', grade: '', role: 'student' as UserRole, permissions: [] as string[] });
const errors = ref<Record<string, string>>({});

watch(() => props.open, (val) => {
  if (val) {
    if (props.editUser) {
      form.value = {
        name: props.editUser.name,
        email: props.editUser.email,
        password: '',
        grade: props.editUser.grade || '',
        role: props.editUser.role,
        permissions: [...(props.editUser.permissions || [])]
      };
    } else {
      form.value = { name: '', email: '', password: '', grade: '', role: 'student', permissions: [] };
    }
    errors.value = {};
  }
});

const grades = ['الصف الأول الابتدائي', 'الصف الثاني الابتدائي', 'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي',
  'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
  'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

const allPermissions = Object.values(PERMISSIONS);

function validate(): boolean {
  errors.value = {};
  if (!form.value.name.trim()) errors.value.name = 'الاسم مطلوب';
  if (!form.value.email.trim() || !/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = 'بريد إلكتروني صحيح مطلوب';

  const needPassword = !props.editUser;
  const updatingPassword = !!props.editUser && form.value.password.length > 0;
  if (needPassword || updatingPassword) {
    const policyErr = validatePasswordAgainstPolicy(
      form.value.password,
      settingsStore.settings.security.passwordPolicy
    );
    if (policyErr) errors.value.password = policyErr;
  }
  return Object.keys(errors.value).length === 0;
}

function togglePermission(p: string) {
  const idx = form.value.permissions.indexOf(p);
  if (idx === -1) form.value.permissions.push(p);
  else form.value.permissions.splice(idx, 1);
}

function selectAll() { form.value.permissions = [...allPermissions]; }
function clearAll() { form.value.permissions = []; }

function submit() {
  if (!validate()) return;
  emit('save', { ...form.value });
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="uf-backdrop" @click.self="emit('close')">
      <div class="uf-dialog">
        <div class="uf-header">
          <h3 class="font-ar">{{ editUser ? 'تعديل المستخدم' : 'مستخدم جديد' }}</h3>
          <button class="uf-close" @click="emit('close')"><AppIcon name="X" :size="18" /></button>
        </div>

        <div class="uf-body">
          <div class="field-row">
            <label class="field-label font-ar">الاسم الكامل</label>
            <input v-model="form.name" class="field-input font-ar" placeholder="محمد علي" />
            <span v-if="errors.name" class="field-error font-ar">{{ errors.name }}</span>
          </div>

          <div class="field-row">
            <label class="field-label font-ar">البريد الإلكتروني</label>
            <input v-model="form.email" type="email" class="field-input font-en" placeholder="example@mail.com" />
            <span v-if="errors.email" class="field-error font-ar">{{ errors.email }}</span>
          </div>

          <div v-if="!editUser" class="field-row">
            <label class="field-label font-ar">كلمة المرور</label>
            <input v-model="form.password" type="password" class="field-input font-en" placeholder="6 أحرف على الأقل" />
            <span v-if="errors.password" class="field-error font-ar">{{ errors.password }}</span>
          </div>

          <div class="field-row">
            <label class="field-label font-ar">الصف الدراسي</label>
            <select v-model="form.grade" class="field-input font-ar">
              <option value="">— اختر الصف —</option>
              <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div class="field-row">
            <label class="field-label font-ar">الدور</label>
            <select v-model="form.role" class="field-input font-ar">
              <option value="student">طالب</option>
              <option value="admin">مدير</option>
              <option value="super_admin">سوبر أدمن</option>
            </select>
          </div>

          <!-- Permissions for admin -->
          <div v-if="form.role === 'admin'" class="permissions-section">
            <div class="perm-header">
              <label class="field-label font-ar">الصلاحيات</label>
              <div class="perm-actions">
                <button class="perm-btn font-ar" @click="selectAll">تحديد الكل</button>
                <button class="perm-btn font-ar" @click="clearAll">إلغاء الكل</button>
              </div>
            </div>
            <div class="perm-grid">
              <label v-for="p in allPermissions" :key="p" class="perm-check font-en">
                <input type="checkbox" :checked="form.permissions.includes(p)" @change="togglePermission(p)" />
                {{ p }}
              </label>
            </div>
          </div>
        </div>

        <div class="uf-footer">
          <button class="btn btn-ghost font-ar" @click="emit('close')">إلغاء</button>
          <button class="btn btn-primary font-ar" @click="submit">
            {{ editUser ? 'حفظ التعديلات' : 'إنشاء المستخدم' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.uf-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: var(--z-modal-backdrop); padding: 1rem; }
.uf-dialog { background: var(--bg-card); border-radius: var(--radius-xl); width: 100%; max-width: 520px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow-xl); }
.uf-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg); border-bottom: 1px solid var(--border-color); }
.uf-header h3 { font-size: var(--text-h4); color: var(--text-primary); }
.uf-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: var(--radius-sm); transition: color var(--duration-fast); }
.uf-close:hover { color: var(--text-primary); }
.uf-body { flex: 1; overflow-y: auto; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
.uf-footer { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--border-color); display: flex; gap: var(--space-sm); justify-content: flex-end; }

.field-row { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
.field-input { padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-input); color: var(--text-primary); font-size: 0.875rem; outline: none; transition: border-color var(--duration-fast); }
.field-input:focus { border-color: var(--color-gold); }
.field-error { font-size: 0.75rem; color: var(--color-error); }

.permissions-section { border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-md); }
.perm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.perm-actions { display: flex; gap: 0.5rem; }
.perm-btn { background: none; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer; color: var(--text-secondary); }
.perm-btn:hover { background: var(--bg-section); }
.perm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.perm-check { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer; }
.perm-check input { cursor: pointer; }

.btn { padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-ghost:hover { background: var(--bg-section); }
</style>
