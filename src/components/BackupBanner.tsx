export default function BackupBanner() {
  return (
    <div
      className="mx-4 px-4 py-2.5 text-center text-sm rounded-lg"
      style={{
        backgroundColor: 'var(--color-gold-light)',
        color: 'var(--color-gold)',
        fontSize: '0.75rem',
        letterSpacing: '0.05em',
      }}
    >
      ⚠ 久未备份，请前往「账目」页导出，以防数据遗失
    </div>
  )
}
