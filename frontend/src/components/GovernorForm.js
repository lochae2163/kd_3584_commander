import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/GovernorForm.css';

function GovernorForm({ governor, onSubmit, onCancel }) {
  const { t } = useTranslation('governor');
  const [name, setName] = useState(governor?.name || '');
  const [vipLevel, setVipLevel] = useState(governor?.vipLevel || 0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('form.nameRequired'));
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), vipLevel });
    } catch (err) {
      setError(err.response?.data?.error || t('errors.failedToSave'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{governor ? t('form.editTitle') : t('form.addTitle')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{t('form.governorName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.governorNamePlaceholder')}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label>{t('form.vipLevel')}</label>
            <select value={vipLevel} onChange={(e) => setVipLevel(Number(e.target.value))}>
              {Array.from({ length: 19 }, (_, i) => (
                <option key={i} value={i}>
                  {t('common:labels.vip')} {i}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              {t('common:buttons.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('common:status.saving') : t('common:buttons.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GovernorForm;
