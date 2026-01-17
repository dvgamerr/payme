<script>
  import { onMount } from 'svelte'
  import Button from './ui/Button.svelte'
  import Input from './ui/Input.svelte'
  import Card from './ui/Card.svelte'
  import { settings } from '../stores/settings.js'

  let baseCurrency = 'THB'
  let currencySymbol = '฿'
  let isSaving = false
  let message = ''
  let messageType = ''

  onMount(() => {
    const unsubscribe = settings.subscribe((state) => {
      if (state.loaded) {
        baseCurrency = state.baseCurrency
        currencySymbol = state.currencySymbol
      }
    })

    return unsubscribe
  })

  async function handleSave() {
    if (!baseCurrency || !currencySymbol) {
      showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error')
      return
    }

    isSaving = true
    message = ''

    const success = await settings.save({ baseCurrency, currencySymbol })

    if (success) {
      showMessage('บันทึกการตั้งค่าสำเร็จ!', 'success')
    } else {
      showMessage('เกิดข้อผิดพลาดในการบันทึก', 'error')
    }

    isSaving = false
  }

  function showMessage(text, type) {
    message = text
    messageType = type
    setTimeout(() => {
      message = ''
      messageType = ''
    }, 3000)
  }
</script>

<Card>
  <div class="settings-container">
    <h2 class="settings-title">⚙️ ตั้งค่าระบบ</h2>

    <div class="settings-section">
      <h3 class="section-title">สกุลเงิน</h3>

      <div class="form-group">
        <label for="baseCurrency">รหัสสกุลเงิน (Currency Code)</label>
        <Input
          id="baseCurrency"
          type="text"
          bind:value={baseCurrency}
          placeholder="เช่น THB, USD, EUR"
          maxlength="10"
        />
        <p class="help-text">รหัสสกุลเงินมาตรฐานสากล (เช่น THB, USD, EUR, JPY)</p>
      </div>

      <div class="form-group">
        <label for="currencySymbol">สัญลักษณ์สกุลเงิน (Currency Symbol)</label>
        <Input
          id="currencySymbol"
          type="text"
          bind:value={currencySymbol}
          placeholder="เช่น ฿, $, €"
          maxlength="5"
        />
        <p class="help-text">สัญลักษณ์ที่จะแสดงหน้าตัวเลข (เช่น ฿, $, €, ¥)</p>
      </div>

      <div class="preview-box">
        <strong>ตัวอย่างการแสดงผล:</strong>
        <span class="preview-amount">{currencySymbol || '฿'}1,234.56</span>
      </div>
    </div>

    {#if message}
      <div class="message {messageType}">
        {message}
      </div>
    {/if}

    <div class="button-group">
      <Button on:click={handleSave} disabled={isSaving}>
        {isSaving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
      </Button>
    </div>
  </div>
</Card>

<style>
  .settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .settings-title {
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 2rem;
    color: var(--text-primary);
    text-align: center;
  }

  .settings-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
    border-bottom: 2px solid var(--border);
    padding-bottom: 0.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .help-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .preview-box {
    background: var(--bg-secondary);
    border: 2px dashed var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1.5rem;
    text-align: center;
  }

  .preview-amount {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
    margin-top: 0.5rem;
  }

  .message {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .button-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
</style>
