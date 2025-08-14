import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParams,useLocation } from 'react-router-dom';

function FilledPdf() {
   const navigate = useNavigate();
    const { applicationId } = useParams();
    const location = useLocation();

    const [formData, setFormData] = useState({
        application_id: '',
        applicant_name: '',
        father_or_spouse_name: '',
        applicant_age: '',
        caste: '',
        is_disabled: '',
        disability_details: '',
        occupation: '',
        income_proof: null,
        current_address: '',
        permanent_address: '',
        current_residence_address: '',
        residence_since: '',
        residence_proof: null,
        previous_residence_details: '',
        residence_address: '',
        residence_from: '',
        residence_to: '',
        district: '',
        nearest_police_station: '',
        adult_members: '',
        minor_members: '',
        total_members: '',
        family_reputation: '',
        tehsil_amin_report: '',
        commercial_tax_amin_report: '',
        collection_section_report: '',
        land_encroachment: '',
        land_dispute: '',
        administrative_cooperation: '',
        small_savings_contribution: '',
        family_planning_contribution: '',
        succession_dispute: '',
        weapon_license_need: '',
        naib_tehsildar_opinion: '',
        tehsildar_opinion: '',
        sdm_opinion: '',
        report_date: '',
        assigned_by: '',
        submitted_by: '',
        signature_file: null,
        police_station_name: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (applicationId) {
            setFormData(prev => ({
                ...prev,
                application_id: applicationId
            }));
        }
    }, [applicationId]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const assignedBy = params.get('assignedBy');
        if (assignedBy) {
            setFormData(prev => ({
                ...prev,
                assigned_by: assignedBy
            }));
        }
    }, [location.search]);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
        // Map UI field names to API field names
        const apiData = {
            application_id: formData.application_id,
            applicant_name: formData.applicant_name,
            father_or_spouse_name: formData.father_or_spouse_name || formData.father_or_spouse_name, // UI field
            age: formData.applicant_age, // UI: applicant_age
            caste: formData.caste,
            is_physically_disabled: formData.is_disabled, // UI: is_disabled
            disability_details: formData.disability_details,
            occupation: formData.occupation,
            income_tax_return: '', // Add a field/input for this if needed
            income_tax_return_url: formData.income_proof, // UI: income_proof (file)
            address: formData.current_address,
            permanent_address: formData.permanent_address,
            current_address: formData.current_residence_address,
            residence_duration: formData.residence_since,
            residence_proof: '', // Add a field/input for this if needed
            residence_proof_url: formData.residence_proof, // UI: residence_proof (file)
            previous_residences: formData.previous_residence_details,
            postal_address: formData.residence_address,
            residence_start_date: formData.residence_from,
            residence_end_date: formData.residence_to,
            police_station_area: formData.nearest_police_station,
            district: formData.district,
            adult_members: formData.adult_members,
            minor_members: formData.minor_members,
            total_members: formData.total_members,
            family_reputation: formData.family_reputation,
            tehsil_amin_report: formData.tehsil_amin_report,
            commercial_tax_report: formData.commercial_tax_amin_report,
            collection_section_report: formData.collection_section_report,
            land_encroachment: formData.land_encroachment,
            land_dispute: formData.land_dispute,
            admin_cooperation: formData.administrative_cooperation,
            savings_contribution: formData.small_savings_contribution,
            family_planning: formData.family_planning_contribution,
            succession_dispute: formData.succession_dispute,
            weapon_license_reason: formData.weapon_license_need,
            naib_tehsildar_opinion: formData.naib_tehsildar_opinion,
            tehsildar_opinion: formData.tehsildar_opinion,
            sdm_opinion: formData.sdm_opinion,
            rejection_reason: '', // Add a field/input for this if needed
            report_date: formData.report_date,
            seal: '', // Add a field/input for this if needed
            signature: '', // Add a field/input for this if needed
            police_incharge: '', // Add a field/input for this if needed
            police_station: formData.police_station_name,
            assigned_by: formData.assigned_by,
            submitted_by: formData.submitted_by,
        };

    const formDataToSend = new FormData();

if (formData.income_proof) {
    formDataToSend.append('income_tax_return_url', formData.income_proof);
}
if (formData.residence_proof) {
    formDataToSend.append('residence_proof_url', formData.residence_proof);
}
if (formData.signature_file) {
    formDataToSend.append('signature_file', formData.signature_file);
}

Object.keys(apiData).forEach(key => {
    // Skip file fields already handled
    if (
        key === 'income_tax_return_url' ||
        key === 'residence_proof_url' ||
        key === 'signature_file'
    ) return;
    formDataToSend.append(key, apiData[key] || '');
});

        // Signature file
        // if (formData.signature_file) {
        //     formDataToSend.append('signature_file', formData.signature_file);
        // }

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            setMessage('Authentication token not found. Please login again.');
            setLoading(false);
            return;
        }

        // Debug: log all fields
        for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}:`, value);
        }

        const response = await fetch('https://lampserver.uppolice.co.in/validation-report/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataToSend
        });

        if (!response.ok) {
            const errorText = await response.text();
            setMessage(`Server error: ${response.status} - ${errorText}`);
            setLoading(false);
            return;
        }

        const result = await response.json();
        if (result.status) {
            setMessage('SDM Validation report submitted successfully!');
            setTimeout(() => {
                navigate('/Dashboard');
            }, 2000);
        } else {
            setMessage(result.message || 'Failed to submit validation report');
        }
    } catch (error) {
        setMessage('An error occurred: ' + error.message);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            if (!applicationId) return;
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(
                    `https://lampserver.uppolice.co.in/arms/get-application?application_id=${applicationId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        }
                    }
                );
                const data = await response.json();
                if (data.status && Array.isArray(data.data) && data.data.length > 0) {
                    const app = data.data[0].application;
                    setFormData(prev => ({
                        ...prev,
                        application_id: app.id || '',
                        applicant_name: app.applicant_name || '',
                        father_or_spouse_name: app.parent_spouse_name || '',
                        applicant_age: app.date_of_birth ?
                            (new Date().getFullYear() - new Date(app.date_of_birth).getFullYear()).toString() : '',
                        caste: app.caste || '',
                        occupation: app.occupation || '',
                        current_address: app.present_address || '',
                        permanent_address: app.permanent_address || '',
                        current_residence_address: app.present_address || '',
                        residence_since: app.residence_since ? app.residence_since.slice(0, 10) : '',
                        nearest_police_station: app.nearest_police_station || '',
                        district: app.district || '',
                        pan_number: app.pan_number || '',
                        // Add more mappings as needed for your form fields
                    }));
                }
            } catch (error) {
                console.error('Error fetching application details:', error);
            }
        };
        fetchApplicationDetails();
    }, [applicationId]);

    return (
        <div className='container py-4'>
            <div className='row'>
                <div className='col-12'>
                    <div className='pdf-text text-center'>
                        <h3 className="mb-2">अनुज्ञप्ति दिये जाने के आवेदन पत्र पर तहसीलदार की जांच आख्या का प्रारूप</h3>
                        <h4>(आख्या प्रत्येक कर्मचारी / अधिकारी के स्पष्ट हस्ताक्षर, नाम एवं पदनाम क मोहर सहित अंकित की जाये)</h4>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-3`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className='row'>
                    <div className='col-12'>
                        <div className='table-responsive mt-table'>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th className='tble-pdf-center' scope="col" colSpan={3}>VALIDATION REPORT</th>
                                    </tr>
                                    <tr>
                                        <th scope="col">Application ID</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="application_id"
                                                value={formData.application_id}
                                                onChange={handleInputChange}
                                                required
                                                readOnly
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">1. आवेदक का नाम</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="applicant_name"
                                                value={formData.applicant_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">पिता/पति-पत्नी का नाम</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="father_spouse_name"
                                                value={formData.father_or_spouse_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">2. आवेदक की आयु</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="applicant_age"
                                                value={formData.applicant_age}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">3. आवेदक की जाति (जाति प्रमाण पत्र संलग्न किया जाये)</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="caste"
                                                value={formData.caste}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th RowSpan={2}>4. आवेदक शारीरिक रूप से विकलांग / अक्षम तो नहीं है, <br></br>यदि हॉ तो संक्षिप्त विवरण अंकित किया जाये।</th>
                                        <td >
                                            <div class="form-check">
                                                <input 
                                                    class="form-check-input" 
                                                    type="radio" 
                                                    name="is_disabled" 
                                                    value="हाँ"
                                                    onChange={handleInputChange}
                                                />
                                                <label class="form-check-label" for="flexRadioDefault1">
                                                    हॉ
                                                </label>
                                            </div>
                                        </td>
                                        <td >
                                            <div class="form-check">
                                                <input 
                                                    class="form-check-input" 
                                                    type="radio" 
                                                    name="is_disabled" 
                                                    value="नहीं"
                                                    onChange={handleInputChange}
                                                />
                                                <label class="form-check-label" for="flexRadioDefault2">
                                                    नहीं
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="disability_details"
                                                value={formData.disability_details}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>5. आवेदक का पेशा / व्यवसाय</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>आवेदक की वार्षिक आय <br />(आय प्रमाण-पत्र संलग्न) <br />पैन नं0</th>
                                    </tr>
                                    <tr>
                                        <th >6. आयकर विभाग में दाखिल गत तीन वर्षों की रिटर्न अथवा फार्म-16 की प्रति संलग्न की जाये</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="file" 
                                                className="form-control bor-bg"
                                                name="income_proof"
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >7. आवेदक का पता</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="current_address"
                                                value={formData.current_address}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >स्थायी निवास का पूरा पता (थाना सहित) </th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="permanent_address"
                                                value={formData.permanent_address}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >वर्तमान निवास का पूरा पता (थाना सहित) </th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="current_residence_address"
                                                value={formData.current_residence_address}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th RowSpan={2}>8. आवेदक वर्तमान पते पर कब से निवास कर रहा है। <br />(पुष्टि के अभिलेखीय साक्ष्य एवं निवास प्रमाण-पत्र संलग्न किया जायें)</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="residence_since"
                                                value={formData.residence_since}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="file" 
                                                className="form-control bor-bg"
                                                name="residence_proof"
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >9. आवेदक ने अब से पूर्व किस-किस थाना क्षेत्र / जनपद / राज्य में निवास किया है, का पूर्ण विवरण</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="previous_residence_details"
                                                value={formData.previous_residence_details}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >निवास का पूर्ण / डाकीय पता</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="residence_address"
                                                value={formData.residence_address}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >निवास की अवधि कब से कब तक</th>
                                        <td scope="col">
                                            <input 
                                                type="date" 
                                                className="form-control bor-bg"
                                                name="residence_from"
                                                value={formData.residence_from}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                        <td scope="col">
                                            <input 
                                                type="date" 
                                                className="form-control bor-bg"
                                                name="residence_to"
                                                value={formData.residence_to}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >जनपद</th>
                                        <td scope="col" colSpan={2}>                                        
                                            <select class="form-control" name="district" value={formData.district} onChange={handleInputChange}>
                                                <option value="Malkhana Entry">जनपद</option>
                                                <option value="FSL Entry">जनपद 1</option>
                                                <option value="Other Entry">जनपद 2</option>
                                                <option value="Unclaimed Entry">जनपद 3</option>
                                            </select>
                                            {/* <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                            /> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >थाना क्षेत्र</th>
                                        <td scope="col" colSpan={2}>                                            
                                            <select class="form-control" name="nearest_police_station" value={formData.nearest_police_station} onChange={handleInputChange}>
                                                <option value="Malkhana Entry">थाना क्षेत्र</option>
                                                <option value="FSL Entry">थाना 1</option>
                                                <option value="Other Entry">थाना 2</option>
                                                <option value="Unclaimed Entry">थाना 3</option>
                                            </select>
                                            {/* <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="nearest_police_station"
                                                value={formData.nearest_police_station}
                                                onChange={handleInputChange}
                                                required
                                            /> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>10. आवेदक के पारिवारिक एवं आश्रित सदस्यों का विवरण</th>
                                    </tr>
                                    <tr>
                                        <th >बालिग</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="adult_members"
                                                value={formData.adult_members}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >नाबालिग</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="minor_members"
                                                value={formData.minor_members}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >कुल सदस्य</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="total_members"
                                                value={formData.total_members}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >11. आवेदक व उसके परिवार की आम छवि</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="family_reputation"
                                                value={formData.family_reputation}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>12. आवेदक / उसके परिवार के सदस्यों के विरूद्ध सरकारी धन बकाया के सम्बन्ध में आख्या</th>
                                    </tr>
                                    <tr>
                                        <th >(1) तहसील स्तरीय क्षेत्रीय अमीन की आख्या</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="tehsil_amin_report"
                                                value={formData.tehsil_amin_report}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >(2) वाणिज्य कर अमीन की आख्या</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="commercial_tax_amin_report"
                                                value={formData.commercial_tax_amin_report}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >(3) संग्रह अनुभाग के प्रभारी की आख्या</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="collection_section_report"
                                                value={formData.collection_section_report}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >13. आवेदक /परिवार के सदस्यो ने सरकारी/ग्राम समाज की भूमि पर कब्जाकब्जे में सहयोग तो नहीं किया है?</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="land_encroachment"
                                                value={formData.land_encroachment}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >14. आवेदक उसके परिवार के सदस्यो का कोई भूमि विवाद न्यायालय में चल रहा है अथवा नहीं?</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="land_dispute"
                                                value={formData.land_dispute}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >15. आवेदक द्वारा प्रशासनिक कार्यों में सहयोग की स्थिति ?</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="administrative_cooperation"
                                                value={formData.administrative_cooperation}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >16. अल्प बचत में योगदान ?</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="small_savings_contribution"
                                                value={formData.small_savings_contribution}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >17. परिवार नियोजन में योगदान की स्थिति (कितने बच्चे हैं?)</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="family_planning_contribution"
                                                value={formData.family_planning_contribution}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >18. उत्तराधिकारी प्रकरणों में प्रार्थी के पक्ष में अनुज्ञा-पत्र जारी करने में उत्तराधिकारीयों में कोई विवाद तो नहीं है, यदि कोई विवाद है तो उसका संक्षिप्त विवरण अंकित करें।</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="succession_dispute"
                                                value={formData.succession_dispute}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th >19. आवेदक को शस्त्र लाईसेंस की वास्तविक आवश्यकता का कारण अंकित किया जाये।</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="weapon_license_need"
                                                value={formData.weapon_license_need}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>20. आवेदक को शस्त्र लाईसेंस स्वीकृत किये जाने अथवा स्वीकृत न किये जाने के सम्बन्ध में क्षेत्रीय नायव तहसीदार का स्पष्ट मतः-</th>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={3}>
                                        {/* <input 
                                            type="text" 
                                            className="form-control bor-bg"
                                            name="naib_tehsildar_opinion"
                                            value={formData.naib_tehsildar_opinion}
                                            onChange={handleInputChange}
                                        /> */}
                                        <textarea class="form-control" name="naib_tehsildar_opinion" value={formData.naib_tehsildar_opinion} onChange={handleInputChange} rows="2"></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>21. आवेदक को शस्त्र लाईसेंस स्वीकृत किये जाने अथवा स्वीकृत न किये जाने के सम्बन्ध में तहसीलदार अपने मत का स्पष्ट उल्लेख करें:-</th>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={3}>
                                        {/* <input 
                                            type="text" 
                                            className="form-control bor-bg"
                                            name="tehsildar_opinion"
                                            value={formData.tehsildar_opinion}
                                            onChange={handleInputChange}
                                        /> */}
                                        <textarea class="form-control" name="tehsildar_opinion" value={formData.tehsildar_opinion} onChange={handleInputChange} rows="2"></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>22. आवेदक को शस्त्र लाईसेंस स्वीकृत किये जाने अथवा स्वीकृत न किया जाने सम्बन्ध में उप जिला मजिस्ट्रेट आवेदक का व्यक्तिगत रूप से साक्षात्कार लेने के उपरांत तहसील की उपर्युक्त आख्या का परीक्षण कर अपने मत का स्पट उल्लेख करें:-</th>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={3}>
                                        {/* <input 
                                            type="text" 
                                            className="form-control bor-bg"
                                            name="sdm_opinion"
                                            value={formData.sdm_opinion}
                                            onChange={handleInputChange}
                                        /> */}
                                        <textarea class="form-control" name="sdm_opinion" value={formData.sdm_opinion} onChange={handleInputChange} rows="2"></textarea>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>नोट : आवेदन-पत्र अस्वीकृत किये जाने की संस्तुति किये जाने पर उसके कारण का स्पष्ट उल्लेख अवश्य किया जाये</th>
                                        {/* <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="rejection_reason"
                                                value={formData.rejection_reason}
                                                onChange={handleInputChange}
                                            />
                                        </td> */}
                                    </tr>
                                    <tr>
                                        <th scope="col">तारीख</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="date" 
                                                className="form-control bor-bg"
                                                name="report_date"
                                                value={formData.report_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">द्वारा सौंपा गया</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="assigned_by"
                                                value={formData.assigned_by}
                                                onChange={handleInputChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="col">हस्ताक्षर</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="file" 
                                                className="form-control bor-bg"
                                                name="signature_file"
                                                onChange={handleInputChange}
                                                accept="image/*"
                                                required
                                            />
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <th scope="col">थाना प्रभारी</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="police_station_incharge"
                                                value={formData.police_station_incharge}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <th scope="col">पुलिस थाना</th>
                                        <td scope="col" colSpan={2}>
                                            <input 
                                                type="text" 
                                                className="form-control bor-bg"
                                                name="police_station_name"
                                                value={formData.police_station_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td scope="col" colSpan={3} className='text-center'>
                                            <button
                                                type="submit"
                                                className="btn btn-login w-25"
                                                disabled={loading}
                                            >
                                                {loading ? 'Submitting...' : 'SUBMIT'}
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default FilledPdf