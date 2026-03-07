import { Link } from 'react-router-dom';

function NoteCard({ note }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {}
      <div className="h-40 bg-blue-50 flex items-center justify-center">
        <span className="text-blue-300 text-5xl">📄</span>
      </div>
      
      {}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate" title={note.title}>
          {note.title}
        </h3>
        
        {}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-extrabold text-blue-600">{note.price} TL</span>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
            Category: {note.categoryId} 
          </span>
        </div>

        {}
        <div className="flex justify-between text-sm text-gray-500 mb-4 border-t pt-3 mt-auto">
          <span title="Viewing">👁️ {note.viewCount || 0}</span>
          <span title="Sales">🛒 {note.salesCount || 0}</span>
          <span title="Point">⭐ {note.rating || 0} / 5</span>
        </div>

        {}
        <Link 
          to={`/note/${note.id}`} 
          className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg transition-colors"
        >
          Review the details.
        </Link>
      </div>
    </div>
  );
}

export default NoteCard;