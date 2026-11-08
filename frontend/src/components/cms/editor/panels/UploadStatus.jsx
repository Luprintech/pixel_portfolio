// Avisos de error y de subida de archivos.

export default function UploadStatus({
    uploadError,
    uploading,
}) {
    return (
        <>
            {uploadError && (
                <div className="mx-4 mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {uploadError}
                </div>
            )}

            {!uploadError && uploading && (
                <div className="mx-4 mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                    Subiendo archivo al CMS...
                </div>
            )}
        </>
    );
}
