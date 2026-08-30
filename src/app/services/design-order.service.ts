import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DesignOrderService {
  private _messageTemplate = signal('يعجبني تصميم الكارت بالكود "{id}"');
  private _prefillMessage = signal('');
  private _modalTitle = signal('');
  private _showModal = signal(false);

  messageTemplate = this._messageTemplate.asReadonly();
  prefillMessage = this._prefillMessage.asReadonly();
  modalTitle = this._modalTitle.asReadonly();
  showModal = this._showModal.asReadonly();

  setTemplate(template: string) {
    this._messageTemplate.set(template);
  }

  buildMessage(designId: string): string {
    return this._messageTemplate().replace('{id}', designId);
  }

  openModal(designId: string, title?: string) {
    this._prefillMessage.set(this.buildMessage(designId));
    this._modalTitle.set(title || '');
    this._showModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  openModalWithMessage(message: string, title?: string) {
    this._prefillMessage.set(message);
    this._modalTitle.set(title || '');
    this._showModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this._showModal.set(false);
    this._prefillMessage.set('');
    this._modalTitle.set('');
    document.body.style.overflow = '';
  }
}
