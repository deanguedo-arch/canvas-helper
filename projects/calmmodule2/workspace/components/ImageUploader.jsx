const ImageUploader = ({ image, onImageChange }) => {
            const canvasRef = useRef(null);

            const handleFile = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        
                        // Scale down if too large (Max width 800px)
                        const MAX_WIDTH = 800;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress to JPEG to save localStorage quota
                        const base64 = canvas.toDataURL('image/jpeg', 0.6);
                        onImageChange(base64);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };

            return (
                <div className="mt-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-colors relative">
                    {image ? (
                        <div className="relative inline-block">
                            <img src={image} alt="Uploaded evidence" className="max-w-full h-auto rounded-xl border shadow-sm" />
                            <button 
                                onClick={() => onImageChange(null)}
                                className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-2xl shadow-sm">
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div>
                                <span className="font-bold text-slate-700">Click to upload</span> or drag and drop
                                <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 5MB (Auto-compressed)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                        </label>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            );
        };
