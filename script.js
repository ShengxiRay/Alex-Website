const apiKey = '353773bf728d87aa705834f27b1f41b13508';
        // const searchURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=Alexander+Peter+Lin&sort=pub_date&retmode=json&api_key=${apiKey}`;
        // const CACHE_KEY = 'pubmed_publications_cache';
        // const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours
        // const NCBI_URL = 'https://www.ncbi.nlm.nih.gov/myncbi/alexander.lin.2/bibliography/public/';
        // localStorage.removeItem(CACHE_KEY);
        const searchTerm = 'alexander.lin.2[MyNCBI+Bibliography]';
        const searchURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchTerm}&sort=pub_date&retmode=json&api_key=${apiKey}`;

        const CACHE_KEY = 'pubmed_publications_cache';
        const CACHE_DURATION = 24 * 60 * 60 * 1000; 
        const NCBI_URL = 'https://www.ncbi.nlm.nih.gov/myncbi/alexander.lin.2/bibliography/public/';

        // CLEAR OLD CACHE: Run this once to wipe the old 2022 results from your browser
        localStorage.removeItem(CACHE_KEY);
        // --- 2. MODAL CONTROLS ---
        function openAppointmentModal() { document.getElementById('appointmentModal').style.display = 'block'; }
        function closeAppointmentModal() { document.getElementById('appointmentModal').style.display = 'none'; }

        function openPublicationsViewfinder() {
            document.getElementById('publicationsModal').style.display = 'block';
            fetchPublications();
        }
        function closePublicationsViewfinder() { document.getElementById('publicationsModal').style.display = 'none'; }

        // --- 3. AUTO-FETCH LOGIC (5 NEWEST) ---
        async function fetchPublications() {
            const container = document.getElementById('publicationsContainer');
            
            try {
                const searchResponse = await fetch(searchURL);
                if (!searchResponse.ok) throw new Error('PubMed Search Failed'); //
                
                const searchData = await searchResponse.json();
                const ids = searchData.esearchresult.idlist.slice(0, 5).join(',');

                if (ids) {
                    const summaryURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids}&retmode=json&api_key=${apiKey}`;
                    const summaryResponse = await fetch(summaryURL);
                    if (!summaryResponse.ok) throw new Error('PubMed Summary Failed'); //
                    
                    const summaryData = await summaryResponse.json();
                    
                    const livePubs = Object.values(summaryData.result).filter(p => p.uid).map(pub => ({
                        title: pub.title,
                        authors: pub.authors.map(a => a.name).join(', '),
                        journal: `${pub.source}. ${pub.pubdate}`,
                        url: `https://pubmed.ncbi.nlm.nih.gov/${pub.uid}/`
                    }));

                    displayPublications(livePubs);
                } else {
                    throw new Error('No publications found');
                }
            } catch (error) {
                console.error("PubMed Error:", error);
                // STOP THE LOADING STATE: Show the fallback immediately
                container.innerHTML = `<div style="text-align:center; padding: 20px;">
                    <p>Live feed unavailable. Showing saved publications:</p>
                </div>`;
                
                const fallback = [
                    {
                        title: "Brain creatine concentrations are associated with sex and symptom severity after concussion...",
                        authors: "Howell DR, Keeter CL, Hatolkar V, et al",
                        journal: "Brain Inj. 2026 Jan 7",
                        url: "https://pubmed.ncbi.nlm.nih.gov/41504207/"
                    }
                    // Add other fallbacks from your original list
                ];
                displayPublications(fallback);
            }
        }

        // --- 4. UI DISPLAY (MATCHING YOUR DESIGN) ---
        function displayPublications(publications) {
            const container = document.getElementById('publicationsContainer');
            
            // Maps the 5 newest into the viewfinder list
            container.innerHTML = publications.map((pub, index) => `
                <a href="${pub.url || '#'}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="publication-item" style="cursor: pointer;">
                        <div class="publication-title">${index + 1}. ${pub.title}</div>
                        <div class="publication-authors">${pub.authors}</div>
                        <div class="publication-journal">${pub.journal}</div>
                    </div>
                </a>
            `).join('');

            // Adds the "View more" button at the bottom [cite: 70-72]
            container.innerHTML += `
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 12px;">To find more Visit the NCBI bibliography:</p>
                    <a href="${NCBI_URL}" target="_blank" style="background: white; color: black; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-size: 1rem; font-weight: 600; display: inline-block; transition: 0.3s;" 
                    onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">View Publications on NCBI</a>
                    <p style="margin-top: 15px; font-size: 0.8rem; color: rgba(0, 242, 255, 0.5);">Last updated: ${new Date().toLocaleString()}</p>
                </div>
            `;
        }

        // --- 5. PRESERVED ORIGINAL APP LOGIC ---
        window.onclick = function(event) {
            const modals = ['appointmentModal', 'publicationsModal', 'locationsModal', 'givingModal', 'radiologyModal', 'researchStaffModal', 'advisorsModal'];
            modals.forEach(id => {
                const modal = document.getElementById(id);
                if (event.target == modal) modal.style.display = 'none';
            });
        }

        // Preserved Location & Staff functions
        function openLocationsViewfinder() { document.getElementById('locationsModal').style.display = 'block'; fetchLocations(); }
        function closeLocationsViewfinder() { document.getElementById('locationsModal').style.display = 'none'; }
        function openGivingViewfinder() { document.getElementById('givingModal').style.display = 'block'; }
        function closeGivingViewfinder() { document.getElementById('givingModal').style.display = 'none'; }
        function openRadiologyViewfinder() { document.getElementById('radiologyModal').style.display = 'block'; }
        function closeRadiologyViewfinder() { document.getElementById('radiologyModal').style.display = 'none'; }
        function openResearchStaffViewfinder() { document.getElementById('researchStaffModal').style.display = 'block'; }
        function closeResearchStaffViewfinder() { document.getElementById('researchStaffModal').style.display = 'none'; }
        function openAdvisorsViewfinder() { document.getElementById('advisorsModal').style.display = 'block'; }
        function closeAdvisorsViewfinder() { document.getElementById('advisorsModal').style.display = 'none'; }

        function fetchLocations() {
            const locations = [
                { name: "Brigham and Women's Hospital - Main Campus", address: "75 Francis Street, Boston, MA 02115", mapsUrl: "http://maps.google.com", image: "location_pictures/bwh.png" },
                { name: "Brigham and Women's Faulkner Hospital", address: "1153 Center Street, Boston, MA 02130", mapsUrl: "http://maps.google.com", image: "location_pictures/bwfh.png" }
            ];
            displayLocations(locations);
        }

        function displayLocations(locations) {
            const container = document.getElementById('locationsContainer');
            container.innerHTML = locations.map((loc) => `
                <a href="${loc.mapsUrl}" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="location-item">
                        <img src="${loc.image}" alt="${loc.name}" class="location-image" onerror="this.src='https://via.placeholder.com/140?text=BWH'">
                        <div class="location-content">
                            <div class="location-name">${loc.name}</div>
                            <div class="location-address">${loc.address}</div>
                        </div>
                    </div>
                </a>
            `).join('');
        }