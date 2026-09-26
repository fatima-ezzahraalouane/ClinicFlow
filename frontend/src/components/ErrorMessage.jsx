export default function ErrorMessage({ error }) {
  if (!error) return null;

  return (
    <div className="error">
      <p>{error.message}</p>
      {error.errors?.length > 0 && (
        <ul>
          {error.errors.map((item, index) => (
            <li key={index}>
              {item.field}: {item.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
