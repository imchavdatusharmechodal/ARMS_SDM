import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem('authToken');
  const [assignedBy, setAssignedBy] = useState({}); 
  const [submittedReports, setSubmittedReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingApplications, setSendingApplications] = useState({}); // Track sending state
  const itemsPerPage = 10;

  const filteredApplications = applications.filter(app => {
    const status = (app.status || '').replace(/\s+/g, '').toLowerCase();
    const filter = (filterStatus || '').replace(/\s+/g, '').toLowerCase();

    // Status filter
    let statusMatch = false;
    if (filter === 'all' || filter === 'selectstatus') statusMatch = true;
    else if (filter === 'pending') statusMatch = status === 'pending';
    else if (filter === 'inprogress') statusMatch = status === 'inprogress';
    else if (filter === 'returned' || filter === 'return') statusMatch = status === 'returned' || status === 'return';

    // Search filter
    const term = searchTerm.trim().toLowerCase();
    let searchMatch = true;
    if (term) {
      searchMatch =
        (app.applicant_name || '').toLowerCase().includes(term) ||
        (app.mobile_number || '').toLowerCase().includes(term) ||
        (`F${String(app.id).padStart(3, '0')}`).toLowerCase().includes(term);
    }

    return statusMatch && searchMatch;
  });

  const paginatedApplications = filteredApplications
    .filter(app => app.forwarded_to_sdm)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredApplications.filter(app => app.forwarded_to_sdm).length / itemsPerPage);

  useEffect(() => {
    const fetchSubmittedReports = async () => {
      try {
        const response = await axios.get('https://lampserver.uppolice.co.in/validation-report/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reportIds = Array.isArray(response.data.data)
          ? response.data.data.map(report => String(report.application_id))
          : [];
        setSubmittedReports(reportIds);
      } catch (error) {
        console.error('Error fetching validation reports', error);
      }
    };
    fetchSubmittedReports();
  }, [token]);

  useEffect(() => {
    fetchSDMApplications(token);
  }, [token]);

  const fetchSDMApplications = async (token) => {
    try {
      const response = await axios.get('https://lampserver.uppolice.co.in/arms/sdm-applications', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('SDM API response:', response.data);
      
      // Handle the response data structure
      let apps = [];
      if (response.data && response.data.data) {
        apps = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        apps = response.data;
      }
      
      // Sort by id descending (most recent first)
      apps.sort((a, b) => b.id - a.id);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching SDM applications', error);
    }
  };

  // New function to send application to tehsildar
  const handleSendToTehsildar = async (applicationId) => {
    // Set sending state for this application
    setSendingApplications(prev => ({ ...prev, [applicationId]: true }));

    try {
      const response = await axios.post('https://lampserver.uppolice.co.in/arms/forward-to-sdm-ps', {
        application_id: applicationId,
        action: "forward_to_tehsildar"
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      console.log('Send to tehsildar response:', response.data);
      
      // Update the application status in the local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, forwarded_to_tehsildar: true, status: 'forwarded_to_tehsildar' }
          : app
      ));

      alert('Application sent to Tehsildar successfully!');
    } catch (error) {
      console.error('Error sending application to tehsildar:', error);
      alert('Failed to send application to Tehsildar. Please try again.');
    } finally {
      // Clear sending state
      setSendingApplications(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this application?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://lampserver.uppolice.co.in/arms/application/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(prev => prev.filter(app => app.id !== id));
      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Failed to delete application", error);
      alert("Failed to delete application");
    }
  };

  const handleAssignedByChange = (appId, value) => {
    setAssignedBy(prev => ({
      ...prev,
      [appId]: value
    }));
  };

  return (
    <div>
      <Sidebar />
      <div className="asside">
        <div className="about-first">
          <div className="row">
            <div className="col-12 mb-24">
              <div className="bg-box">
                <div className="pro-add-new px-0">
                  <p>
                     List Of Application <span>{filteredApplications.length}</span>
                  </p>
                  <div className="status-search">
                    <div>
                      <select
                        name="entryType"
                        className="form-control"
                        id="entryType"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="Select Status">Select Status</option>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Inprogress">In Progress</option>
                        <option value="Return">Returned</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="search"
                        className="form-control me-2"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>  
                  </div>
                </div>
                <div className="table-responsive table-x">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Sr No</th>
                        <th scope="col">File No</th>
                        <th scope="col">Name</th>
                        <th scope="col">Mobile Number</th>
                        <th scope="col">Service Name</th>
                        <th scope="col">Application Date</th>
                        <th scope="col">Status</th>
                         <th scope="col">Notes</th>
                        <th scope="col">View</th>
                        <th scope="col">Assigned By</th>
                        <th scope="col">Submit Report</th>
                        <th scope="col">Send</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedApplications
                        .filter(app => app.forwarded_to_sdm) // Only show sent to SDM
                        .map((app, index) => (
                          <tr key={app.id}>
                            <th scope="row">{(currentPage - 1) * itemsPerPage + index + 1}</th>
                            <td>{`F${app.id !== undefined && app.id !== null ? app.id.toString().padStart(3, '0') : ''}`}</td>
                            <td>{app.applicant_name }</td>
                            <td>{app.mobile_number}</td>
                            <td>{app.service}</td>
                            <td>{app.created_at?.slice(0, 10).split("-").reverse().join("/")}</td>
                            <td>
                              <span className={`badge ${app.status === 'pending' ? 'bg-warning text-dark' : app.status === 'In Progress' || 'forwarded_to_sdm_ps' ? 'bg-info text-dark' : 'bg-success'}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.sdm_remarks || "-"}
                            </td>
                            <td>
                              <Link to={`/filled-pdf/${app.id}`}>
                                <i className="fa-solid fa-eye text-success"></i>
                              </Link>
                            </td>
                            <td>
                              <select className="form-select form-select-sm mb-2"
                                    value={assignedBy[app.id] || ''}
                                    onChange={e => handleAssignedByChange(app.id, e.target.value)}>
                              <option value="">Assign By</option>
                              <option value="Gaurav Sharma">Gaurav Sharma</option>
                              <option value="Darshan Vaghani">Darshan Vaghani</option>
                              <option value="Amit Parmar">Amit Parmar</option>
                            </select>
                            </td>
                            <td>
                          {submittedReports.includes(String(app.id)) ? (
                            <Link to={`/sdm-report/${app.id}`} target='_blank' className="btn btn-success btn-sm">
                              View Report
                            </Link>
                          ) : (
                            <Link to={`/validation-report/${app.id}?assignedBy=${encodeURIComponent(assignedBy[app.id] || '')}`} className="btn btn-primary btn-sm">
                              Submit Report
                            </Link>
                          )}
                        </td>
                         <td>
                            {app.forwarded_to_tehsildar ? (
                              <span className="badge bg-success">Sent</span>
                            ) : (
                              <button
                                className="btn btn-info btn-sm text-white"
                                onClick={() => handleSendToTehsildar(app.id)}
                                disabled={sendingApplications[app.id]}
                              >
                                {sendingApplications[app.id] ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin me-1"></i>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-paper-plane me-1"></i>
                                    Tehsildar
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        
                          {/* <td>
                            <div className="icon-up-del">
                              <button
                                className="btn btn-danger text-white m-0"
                                onClick={() => handleDelete(app.id)}
                              >
                                <i className="fa-solid fa-trash m-0"></i>
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pro-add-new px-0 mb-0 pt-3">
  <p>
    {filteredApplications.filter(app => app.forwarded_to_sdm).length === 0
      ? "No records"
      : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredApplications.filter(app => app.forwarded_to_sdm).length)} of ${filteredApplications.filter(app => app.forwarded_to_sdm).length}`}
  </p>
  <nav aria-label="...">
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
      </li>
      {Array.from({ length: totalPages }, (_, i) => (
        <li key={i} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
        </li>
      ))}
      <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </li>
    </ul>
  </nav>
</div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;