import React, { useEffect, useState } from 'react';
import { Save, ImageIcon, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const HeroEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg1, setUploadingImg1] = useState(false);
  const [uploadingImg2, setUploadingImg2] = useState(false);

  const [formData, setFormData] = useState({
    aboutUsTitle1: '',
    aboutUsHeader1: '',
    aboutUsDesc1: '',
    aboutUsBtn1: '',
    aboutUsImg1: '',

    aboutUsTitle2: '',
    aboutUsHeader2: '',
    aboutUsDesc2: '',
    aboutUsBtn2: '',
    aboutUsImg2: '',

    lookbookTitle: '',
    lookbookHeading1: '',
    lookbookHeading2: '',
    lookbookHeading3: '',
    lookbookHeading4: '',
    lookbookDesc: '',

    mindsetTitle: '',
    mindsetHeading1: '',
    mindsetHeading2: '',
    mindsetDesc: '',
  });

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      const data = await api.hero.get();
      if (data) {
        setFormData({
          aboutUsTitle1: data.aboutUsTitle1 || '',
          aboutUsHeader1: data.aboutUsHeader1 || '',
          aboutUsDesc1: data.aboutUsDesc1 || '',
          aboutUsBtn1: data.aboutUsBtn1 || '',
          aboutUsImg1: data.aboutUsImg1 || '',

          aboutUsTitle2: data.aboutUsTitle2 || '',
          aboutUsHeader2: data.aboutUsHeader2 || '',
          aboutUsDesc2: data.aboutUsDesc2 || '',
          aboutUsBtn2: data.aboutUsBtn2 || '',
          aboutUsImg2: data.aboutUsImg2 || '',

          lookbookTitle: data.lookbookTitle || '',
          lookbookHeading1: data.lookbookHeading1 || '',
          lookbookHeading2: data.lookbookHeading2 || '',
          lookbookHeading3: data.lookbookHeading3 || '',
          lookbookHeading4: data.lookbookHeading4 || '',
          lookbookDesc: data.lookbookDesc || '',

          mindsetTitle: data.mindsetTitle || '',
          mindsetHeading1: data.mindsetHeading1 || '',
          mindsetHeading2: data.mindsetHeading2 || '',
          mindsetDesc: data.mindsetDesc || '',
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      toast('Failed to load hero content', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e, imageField, setUploadingState) => {
    try {
      setUploadingState(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const result = await api.upload.file(file, 'banners');
      setFormData((prev) => ({ ...prev, [imageField]: result.url }));
      toast('Image uploaded successfully', 'success');
    } catch (error) {
      toast('Error uploading image: ' + error.message, 'error');
      console.error(error);
    } finally {
      setUploadingState(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.hero.update(formData);
      toast('Hero page content updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast('Failed to save hero content: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-gray-400 mt-4">Loading Hero page settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <style>{`
        .custom-textarea-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-textarea-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-textarea-scrollbar::-webkit-scrollbar-thumb {
          background: #2b2b2f;
          border-radius: 10px;
        }
        .custom-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444449;
        }
        .custom-textarea-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #2b2b2f transparent;
        }
      `}</style>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Hero Page</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage the text, options, and layouts of your storefront homepage.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: About Us - Mission */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            About Us - Section 1 (Our Mission)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tagline (Uppercase)</label>
                <input
                  type="text"
                  name="aboutUsTitle1"
                  value={formData.aboutUsTitle1}
                  onChange={handleChange}
                  placeholder="e.g. BUILT DIFFERENT."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading (Uppercase)</label>
                <input
                  type="text"
                  name="aboutUsHeader1"
                  value={formData.aboutUsHeader1}
                  onChange={handleChange}
                  placeholder="e.g. OUR MISSION"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black font-bold font-bebas tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  name="aboutUsDesc1"
                  value={formData.aboutUsDesc1}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your brand's mission..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none custom-textarea-scrollbar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Text</label>
                <input
                  type="text"
                  name="aboutUsBtn1"
                  value={formData.aboutUsBtn1}
                  onChange={handleChange}
                  placeholder="e.g. DISCOVER CROSS"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Image Upload for Section 1 */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Image</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/50 aspect-video relative overflow-hidden group">
                  {formData.aboutUsImg1 ? (
                    <>
                      <img src={formData.aboutUsImg1} alt="Section 1" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'aboutUsImg1', setUploadingImg1)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                      <label className="cursor-pointer inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'aboutUsImg1', setUploadingImg1)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {uploadingImg1 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL (Fallback)</label>
                <input
                  type="text"
                  name="aboutUsImg1"
                  value={formData.aboutUsImg1}
                  onChange={handleChange}
                  placeholder="Or paste an image URL here..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: About Us - Vision */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            About Us - Section 2 (Our Vision)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tagline (Uppercase)</label>
                <input
                  type="text"
                  name="aboutUsTitle2"
                  value={formData.aboutUsTitle2}
                  onChange={handleChange}
                  placeholder="e.g. THINK DIFFERENT."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading (Uppercase)</label>
                <input
                  type="text"
                  name="aboutUsHeader2"
                  value={formData.aboutUsHeader2}
                  onChange={handleChange}
                  placeholder="e.g. OUR VISION"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black font-bold font-bebas tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  name="aboutUsDesc2"
                  value={formData.aboutUsDesc2}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your brand's vision..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none custom-textarea-scrollbar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Text</label>
                <input
                  type="text"
                  name="aboutUsBtn2"
                  value={formData.aboutUsBtn2}
                  onChange={handleChange}
                  placeholder="e.g. EXPLORE OUR STORY"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Image Upload for Section 2 */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Image</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/50 aspect-video relative overflow-hidden group">
                  {formData.aboutUsImg2 ? (
                    <>
                      <img src={formData.aboutUsImg2} alt="Section 2" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'aboutUsImg2', setUploadingImg2)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                      <label className="cursor-pointer inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'aboutUsImg2', setUploadingImg2)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                  {uploadingImg2 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL (Fallback)</label>
                <input
                  type="text"
                  name="aboutUsImg2"
                  value={formData.aboutUsImg2}
                  onChange={handleChange}
                  placeholder="Or paste an image URL here..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Lookbook */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            Lookbook Section
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Badge Text</label>
                <input
                  type="text"
                  name="lookbookTitle"
                  value={formData.lookbookTitle}
                  onChange={handleChange}
                  placeholder="e.g. Lookbook '24"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 1</label>
                  <input
                    type="text"
                    name="lookbookHeading1"
                    value={formData.lookbookHeading1}
                    onChange={handleChange}
                    placeholder="e.g. Timeless"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 2</label>
                  <input
                    type="text"
                    name="lookbookHeading2"
                    value={formData.lookbookHeading2}
                    onChange={handleChange}
                    placeholder="e.g. Pieces."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 3 (Grayed Out)</label>
                  <input
                    type="text"
                    name="lookbookHeading3"
                    value={formData.lookbookHeading3}
                    onChange={handleChange}
                    placeholder="e.g. Limitless"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 4 (Grayed Out)</label>
                  <input
                    type="text"
                    name="lookbookHeading4"
                    value={formData.lookbookHeading4}
                    onChange={handleChange}
                    placeholder="e.g. Vibes."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lookbook Tagline/Description</label>
              <textarea
                name="lookbookDesc"
                value={formData.lookbookDesc}
                onChange={handleChange}
                rows={5}
                placeholder="Designed for the streets.&#10;Made for the misfits."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none custom-textarea-scrollbar"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Tip: Use Enter/New lines to split lines.</span>
            </div>
          </div>
        </div>

        {/* Section 4: Mindset */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            Our Mindset Section
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Badge Text</label>
                <input
                  type="text"
                  name="mindsetTitle"
                  value={formData.mindsetTitle}
                  onChange={handleChange}
                  placeholder="e.g. Our Mindset"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 1</label>
                <input
                  type="text"
                  name="mindsetHeading1"
                  value={formData.mindsetHeading1}
                  onChange={handleChange}
                  placeholder="e.g. We Don't Follow."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading Line 2 (Grayed Out)</label>
                <input
                  type="text"
                  name="mindsetHeading2"
                  value={formData.mindsetHeading2}
                  onChange={handleChange}
                  placeholder="e.g. We Cross."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                name="mindsetDesc"
                value={formData.mindsetDesc}
                onChange={handleChange}
                rows={6}
                placeholder="CROSS isn't just a brand...&#10;We challenge the norm..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none custom-textarea-scrollbar"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-55 disabled:pointer-events-none"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroEditor;
