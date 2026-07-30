import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { authService, volunteerService } from "../../services/api";

// Certifications Component - Same as in VolunteerApplication
function Certifications({ selected, setSelected, others, setOthers }) {
  const [othersChecked, setOthersChecked] = useState(false);

  const handleCheck = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {["CPR(Cardiopulmonary Resuscitation)", "ACLS (Advanced Cardiac Life Support)", "BLS (Basic Life Support)", "First Aid Support"].map((cert) => (
        <label key={cert} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(cert)}
            onChange={() => handleCheck(cert)}
          />
          {cert}
        </label>
      ))}

      <label className="col-span-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={othersChecked}
          onChange={(e) => {
            setOthersChecked(e.target.checked);
            if (!e.target.checked) setOthers("");
          }}
        />
        Others
      </label>

      {othersChecked && (
        <input
          type="text"
          placeholder="Enter certification"
          value={others}
          onChange={(e) => setOthers(e.target.value)}
          className="col-span-2 border p-2 rounded-md mt-2"
        />
      )}
    </div>
  );
}

// Password Strength Component
function PasswordStrength({ password }) {
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "No password", color: "bg-gray-300" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = "";
    let color = "";
    let bgColor = "";

    if (score <= 2) {
      label = "Weak";
      color = "text-red-500";
      bgColor = "bg-red-500";
    } else if (score <= 4) {
      label = "Fair";
      color = "text-yellow-500";
      bgColor = "bg-yellow-500";
    } else if (score <= 5) {
      label = "Good";
      color = "text-blue-500";
      bgColor = "bg-blue-500";
    } else {
      label = "Strong";
      color = "text-green-500";
      bgColor = "bg-green-500";
    }

    setStrength({ score: Math.min(score, 6), label, color, bgColor });
  }, [password]);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index <= strength.score ? strength.bgColor : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs mt-1 font-medium ${strength.color}`}>
          {strength.label}
          {strength.score > 0 && ` (${strength.score}/6)`}
        </p>
      )}
      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
        <div className={`flex items-center gap-1 ${password && password.length >= 8 ? 'text-green-500' : ''}`}>
          <span>{password && password.length >= 8 ? '✅' : '⬜'}</span> Min 8 characters
        </div>
        <div className={`flex items-center gap-1 ${password && /[A-Z]/.test(password) ? 'text-green-500' : ''}`}>
          <span>{password && /[A-Z]/.test(password) ? '✅' : '⬜'}</span> Uppercase letter
        </div>
        <div className={`flex items-center gap-1 ${password && /[a-z]/.test(password) ? 'text-green-500' : ''}`}>
          <span>{password && /[a-z]/.test(password) ? '✅' : '⬜'}</span> Lowercase letter
        </div>
        <div className={`flex items-center gap-1 ${password && /[0-9]/.test(password) ? 'text-green-500' : ''}`}>
          <span>{password && /[0-9]/.test(password) ? '✅' : '⬜'}</span> Number
        </div>
        <div className={`flex items-center gap-1 col-span-2 ${password && /[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}`}>
          <span>{password && /[^A-Za-z0-9]/.test(password) ? '✅' : '⬜'}</span> Special character (!@#$%^&*)
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Account fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+63");
  const [selectedRole, setSelectedRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Volunteer specific fields
  const [birthday, setBirthday] = useState("");
  const [ageError, setAgeError] = useState("");
  const [experience, setExperience] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [othersCert, setOthersCert] = useState("");

  // ✅ NEW FIELDS (Matches VolunteerApproval)
  const [availability, setAvailability] = useState([]);
  const [description, setDescription] = useState("");

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const navigate = useNavigate();
  const phoneInputRef = useRef(null);

  // Helper function to validate email addresses properly
  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return { valid: false, error: "Email is required" };
    }

    const trimmedEmail = email.trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, error: "Please enter a valid email address (e.g., name@domain.com)" };
    }

    const domain = trimmedEmail.split('@')[1];
    const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'ph', 'io', 'co', 'uk', 'au', 'ca', 'de', 'fr', 'jp', 'cn', 'in', 'br', 'mx', 'it', 'es'];
    const tld = domain.split('.').pop().toLowerCase();

    if (!validTLDs.includes(tld)) {
      const commonTypos = {
        'cmo': 'com',
        'con': 'com',
        'ocm': 'com',
        'ogm': 'com',
        'coom': 'com',
        'om': 'com',
        'c0m': 'com',
        'xom': 'com',
        'vom': 'com',
        'gom': 'com'
      };

      if (commonTypos[tld]) {
        return { valid: false, error: `Invalid email domain. Did you mean .${commonTypos[tld]}?` };
      }

      return { valid: false, error: `Please enter a valid email address with a proper domain (e.g., .com, .org, .net, .ph)` };
    }

    return { valid: true, error: null };
  };

  // Format and validate phone number
  const formatAndValidatePhone = (inputValue) => {
    let digits = inputValue.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
      const formatted = '+63' + digits;
      const isValid = digits.length === 10;
      return { formatted, cleaned: '0' + digits, isValid, digitsAfter63: digits.length };
    }

    if (digits.startsWith('63')) {
      digits = digits.substring(2);
      const formatted = '+63' + digits;
      const isValid = digits.length === 10;
      return { formatted, cleaned: '0' + digits, isValid, digitsAfter63: digits.length };
    }

    if (digits.startsWith('9')) {
      const formatted = '+63' + digits;
      const isValid = digits.length === 10;
      return { formatted, cleaned: '0' + digits, isValid, digitsAfter63: digits.length };
    }

    const formatted = '+63' + digits;
    const isValid = digits.length === 10;
    return { formatted, cleaned: digits.length === 10 ? '0' + digits : '', isValid, digitsAfter63: digits.length };
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    if (!value.startsWith('+63')) {
      if (value.startsWith('63')) {
        value = '+' + value;
      } else if (value.startsWith('0')) {
        const digits = value.replace(/\D/g, '');
        const afterZero = digits.substring(1);
        value = '+63' + afterZero;
      } else {
        value = '+63' + value.replace(/\D/g, '');
      }
    }

    let digitsAfter63 = value.replace('+63', '').replace(/\D/g, '');

    if (digitsAfter63.length > 10) {
      digitsAfter63 = digitsAfter63.slice(0, 10);
    }

    let formattedValue = '+63';
    if (digitsAfter63.length > 0) {
      if (digitsAfter63.length <= 3) {
        formattedValue += ' ' + digitsAfter63;
      } else if (digitsAfter63.length <= 6) {
        formattedValue += ' ' + digitsAfter63.slice(0, 3) + ' ' + digitsAfter63.slice(3);
      } else {
        formattedValue += ' ' + digitsAfter63.slice(0, 3) + ' ' + digitsAfter63.slice(3, 6) + ' ' + digitsAfter63.slice(6, 10);
      }
    }

    setPhone(formattedValue);

    if (digitsAfter63.length === 10) {
      setValidationErrors(prev => ({ ...prev, phone: null }));
    } else if (digitsAfter63.length > 0 && digitsAfter63.length < 10) {
      setValidationErrors(prev => ({ ...prev, phone: `Need ${10 - digitsAfter63.length} more digit(s) (${digitsAfter63.length}/10 digits after +63)` }));
    } else if (digitsAfter63.length > 10) {
      setValidationErrors(prev => ({ ...prev, phone: `Too many digits (${digitsAfter63.length - 10} extra digits)` }));
    }
  };

  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.setSelectionRange(3, 3);
    }
  }, []);

  const handlePhoneFocus = (e) => {
    if (e.target.value === '+63') {
      setTimeout(() => {
        e.target.setSelectionRange(3, 3);
      }, 0);
    }
  };

  const validateSignupForm = () => {
    const errors = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    const digitsAfter63 = phone.replace('+63', '').replace(/\D/g, '');
    if (!phone.trim() || phone === '+63') {
      errors.phone = "Phone number is required";
    } else if (digitsAfter63.length !== 10) {
      errors.phone = `Phone number must have exactly 10 digits after +63 (you have ${digitsAfter63.length} digits)`;
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = "Password must contain a special character (!@#$%^&*)";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!selectedRole) {
      errors.role = "Please select a role";
    }

    // Volunteer-specific validations
    if (selectedRole === "volunteer") {
      if (!birthday) {
        errors.birthday = "Birthday is required";
      }
      if (!experience) {
        errors.experience = "Years of experience is required";
      }
      if (!address1.trim()) {
        errors.address1 = "Address is required";
      }
      // ✅ Validate Availability
      if (availability.length === 0) {
        errors.availability = "Please select at least one availability day";
      }
      // ✅ Validate Description
      if (!description.trim()) {
        errors.description = "Please provide a brief description about yourself";
      }
      const allCerts = [...selectedCerts, ...(othersCert ? [othersCert] : [])];
      if (allCerts.length === 0) {
        errors.certifications = "At least one certification is required";
      }
      if (selectedFiles.length === 0) {
        errors.files = "Please upload at least one document";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateAge = (birthdayDate) => {
    if (!birthdayDate) return 0;
    const today = new Date();
    const birthDate = new Date(birthdayDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateAge = (birthdayDate) => {
    if (!birthdayDate) {
      setAgeError("");
      return true;
    }
    const age = calculateAge(birthdayDate);
    if (age < 18) {
      setAgeError("❌ You must be at least 18 years old to apply as a volunteer");
      return false;
    }
    if (age > 50) {
      setAgeError("❌ Maximum age for volunteers is 50 years old");
      return false;
    }
    setAgeError("");
    return true;
  };

  const handleBirthdayChange = (e) => {
    const value = e.target.value;
    setBirthday(value);
    validateAge(value);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    if (role === "volunteer") {
      setShowVolunteerForm(true);
    } else {
      setShowVolunteerForm(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create previews for the UI display only
    const previews = files.map(file => ({
      url: URL.createObjectURL(file), // Only used for UI preview, NOT sent to backend
      name: file.name,
      type: file.type
    }));
    setFilePreviews(previews);
  };

  const removeFile = (index) => {
    if (filePreviews[index]?.url) {
      URL.revokeObjectURL(filePreviews[index].url);
    }
    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleSignup = async () => {
    const currentFirstName = firstName;
    const currentLastName = lastName;
    const currentEmail = email;

    const emailValidation = validateEmail(currentEmail);
    if (!emailValidation.valid) {
      setValidationErrors(prev => ({ ...prev, email: emailValidation.error }));
      setError(emailValidation.error);
      return;
    }

    let digitsAfter63 = phone.replace('+63', '').replace(/\D/g, '');

    if (!phone.trim() || phone === '+63') {
      setValidationErrors(prev => ({ ...prev, phone: "Phone number is required" }));
      setError("Phone number is required");
      return;
    }

    if (digitsAfter63.length !== 10) {
      setValidationErrors(prev => ({ ...prev, phone: `Phone number must have exactly 10 digits after +63 (you have ${digitsAfter63.length} digits)` }));
      setError(`Phone number must have exactly 10 digits after +63 (you have ${digitsAfter63.length} digits)`);
      return;
    }

    const currentPhone = '0' + digitsAfter63;
    const currentPassword = password;
    const currentRole = selectedRole.toLowerCase();
    const currentBirthday = birthday;
    const currentExperience = experience;
    const currentAddress1 = address1;
    const currentAddress2 = address2;
    const currentSelectedCerts = selectedCerts;
    const currentOthersCert = othersCert;
    const currentSelectedFiles = selectedFiles;

    // ✅ Capture new fields
    const currentAvailability = availability;
    const currentDescription = description;

    // Validate using captured values
    const errors = {};

    if (!currentEmail.trim()) errors.email = "Email is required";
    else {
      const emailValid = validateEmail(currentEmail);
      if (!emailValid.valid) errors.email = emailValid.error;
    }

    if (!currentFirstName.trim()) errors.firstName = "First name is required";
    else if (currentFirstName.length < 2) errors.firstName = "First name must be at least 2 characters";

    if (!currentLastName.trim()) errors.lastName = "Last name is required";
    else if (currentLastName.length < 2) errors.lastName = "Last name must be at least 2 characters";

    if (!currentPhone.trim()) errors.phone = "Phone number is required";
    else if (currentPhone.length !== 11) errors.phone = `Phone number must be exactly 11 digits (you have ${currentPhone.length} digits)`;
    else if (!currentPhone.startsWith('09')) errors.phone = "Phone number must start with 09";

    if (!currentPassword) errors.password = "Password is required";
    else if (currentPassword.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(currentPassword)) errors.password = "Password must contain an uppercase letter";
    else if (!/[a-z]/.test(currentPassword)) errors.password = "Password must contain a lowercase letter";
    else if (!/[0-9]/.test(currentPassword)) errors.password = "Password must contain a number";
    else if (!/[^A-Za-z0-9]/.test(currentPassword)) errors.password = "Password must contain a special character";

    if (currentPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!currentRole) errors.role = "Please select a role";

    // Volunteer-specific validations
    if (currentRole === "volunteer") {
      if (!currentBirthday) {
        errors.birthday = "Birthday is required";
      }
      if (!currentExperience) {
        errors.experience = "Years of experience is required";
      }
      if (!currentAddress1.trim()) {
        errors.address1 = "Address is required";
      }
      // ✅ Validate new fields
      if (currentAvailability.length === 0) {
        errors.availability = "Please select at least one availability day";
      }
      if (!currentDescription.trim()) {
        errors.description = "Please provide a brief description about yourself";
      }
      const allCerts = [...currentSelectedCerts, ...(currentOthersCert ? [currentOthersCert] : [])];
      if (allCerts.length === 0) {
        errors.certifications = "At least one certification is required";
      }
      if (currentSelectedFiles.length === 0) {
        errors.files = "Please upload at least one document";
      }
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!termsAccepted) {
      setError("Please accept the Terms and Privacy Policies");
      return;
    }

    if (currentRole === "volunteer") {
      if (!validateAge(currentBirthday)) {
        setError(ageError);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      let response;

      if (currentRole === "volunteer") {
        const formData = new FormData();
        formData.append('firstName', currentFirstName);
        formData.append('lastName', currentLastName);
        formData.append('email', currentEmail);
        formData.append('phoneNumber', currentPhone);
        formData.append('password', currentPassword);
        formData.append('role', currentRole);
        formData.append('birthday', currentBirthday);
        formData.append('yearsOfExperience', currentExperience);
        formData.append('address1', currentAddress1);
        formData.append('address2', currentAddress2 || '');
        formData.append('certifications', JSON.stringify([...currentSelectedCerts, ...(currentOthersCert ? [currentOthersCert] : [])]));

        // ✅ Append new fields
        formData.append('availability', JSON.stringify(currentAvailability));
        formData.append('description', currentDescription);

        if (currentSelectedFiles && currentSelectedFiles.length > 0) {
          currentSelectedFiles.forEach((file) => {
            formData.append(`files`, file);
          });
        }
        response = await authService.registerWithFormData(formData);
      } else {
        const jsonData = {
          firstName: currentFirstName,
          lastName: currentLastName,
          email: currentEmail,
          phoneNumber: currentPhone,
          password: currentPassword,
          role: currentRole
        };
        response = await authService.register(jsonData);
      }

      if (response.success) {
        const userToStore = {
          id: response.user.id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          role: response.user.role,
          phoneNumber: response.user.phoneNumber || "",
          profileImage: response.user.profileImage || ""
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('userRole', response.user.role);

        alert(currentRole === "volunteer"
          ? "Registration successful! Your volunteer application has been submitted for review."
          : "Registration successful!");

        navigate("/login");
      }
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response && err.response.errors) {
        const errorMessages = err.response.errors.map(e => `${e.field}: ${e.message}`).join(", ");
        setError(errorMessages);
      } else if (err.response && err.response.message) {
        setError(err.response.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTermsClick = () => {
    navigate("/terms");
  };

  const handlePrivacyClick = () => {
    navigate("/privacy");
  };

  // ✅ Toggle availability helper
  const toggleAvailability = (day) => {
    setAvailability(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4 sm:px-6 md:px-10 py-6 font-Roboto">
      <div className="p-6 sm:p-8 md:p-10 max-w-4xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="logo" className="h-10 w-10 object-cover" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E252B]">
            Rescue Team
          </h1>
        </div>

        <h2 className="text-4xl font-bold text-[#1E252B] font-serif mb-2">
          Sign up
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Register your credentials to join the Santa Rosa Rescue Team operations network.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>

          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.firstName ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">First Name</legend>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (validationErrors.firstName) {
                      setValidationErrors({ ...validationErrors, firstName: null });
                    }
                  }}
                  placeholder="John"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  required
                />
              </fieldset>
              {validationErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
              )}
            </div>

            <div className="w-full">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.lastName ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">Last Name</legend>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (validationErrors.lastName) {
                      setValidationErrors({ ...validationErrors, lastName: null });
                    }
                  }}
                  placeholder="Doe"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  required
                />
              </fieldset>
              {validationErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">Email</legend>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: null });
                    }
                  }}
                  placeholder="john.doe@gmail.com"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  required
                />
              </fieldset>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="w-full">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">Phone Number</legend>
                <div className="flex items-center">
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onFocus={handlePhoneFocus}
                    placeholder="+63 912 345 6789"
                    className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                    required
                  />
                </div>
              </fieldset>
              <p className="text-gray-400 text-xs mt-1">Enter 10 digits after +63 (e.g., +63 912 345 6789 or type 09123456789)</p>
              {validationErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="w-full">
            <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.role ? 'border-red-500' : 'border-gray-400'
              }`}>
              <legend className="text-sm px-2 text-gray-700">Role / Position</legend>
              <select
                value={selectedRole}
                onChange={(e) => {
                  handleRoleChange(e);
                  if (validationErrors.role) {
                    setValidationErrors({ ...validationErrors, role: null });
                  }
                }}
                className="w-full bg-transparent outline-none text-gray-600"
                required
              >
                <option value="">- Select Role / Position -</option>
                <option value="civilian">Civilian</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </fieldset>
            {validationErrors.role && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
            )}
          </div>

          {/* Volunteer Additional Fields */}
          {showVolunteerForm && (
            <div className="space-y-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <p className="text-sm font-semibold text-blue-700 mb-2">Volunteer Information (Required)</p>
              <p className="text-xs text-gray-500 -mt-2">Age requirement: 18 - 50 years old</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-white ${ageError ? 'border-red-500' : validationErrors.birthday ? 'border-red-500' : 'border-gray-400'}`}>
                    <legend className="text-sm px-2 text-gray-700">Birthday</legend>
                    <input
                      type="date"
                      value={birthday}
                      onChange={handleBirthdayChange}
                      className="w-full bg-transparent outline-none"
                      required
                    />
                  </fieldset>
                  {ageError && <p className="text-red-500 text-xs mt-1">{ageError}</p>}
                  {validationErrors.birthday && <p className="text-red-500 text-xs mt-1">{validationErrors.birthday}</p>}
                </div>

                <div>
                  <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-white ${validationErrors.experience ? 'border-red-500' : 'border-gray-400'}`}>
                    <legend className="text-sm px-2 text-gray-700">Years of Experience</legend>
                    <select
                      value={experience}
                      onChange={(e) => {
                        setExperience(e.target.value);
                        if (validationErrors.experience) {
                          setValidationErrors({ ...validationErrors, experience: null });
                        }
                      }}
                      className="w-full bg-transparent outline-none text-gray-700"
                      required
                    >
                      <option value="">Select experience</option>
                      <option value="0">Less than 1 year</option>
                      <option value="1">1 year</option>
                      <option value="2">2 years</option>
                      <option value="3">3 years</option>
                      <option value="4">4 years</option>
                      <option value="5">5 years</option>
                      <option value="6">6 years</option>
                      <option value="7">7 years</option>
                      <option value="8">8 years</option>
                      <option value="9">9 years</option>
                      <option value="10">10+ years</option>
                    </select>
                  </fieldset>
                  {validationErrors.experience && <p className="text-red-500 text-xs mt-1">{validationErrors.experience}</p>}
                </div>

                <div>
                  <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-white ${validationErrors.address1 ? 'border-red-500' : 'border-gray-400'}`}>
                    <legend className="text-sm px-2 text-gray-700">Address 1</legend>
                    <input
                      type="text"
                      value={address1}
                      onChange={(e) => {
                        setAddress1(e.target.value);
                        if (validationErrors.address1) {
                          setValidationErrors({ ...validationErrors, address1: null });
                        }
                      }}
                      placeholder="Street, Barangay"
                      className="w-full bg-transparent outline-none"
                      required
                    />
                  </fieldset>
                  {validationErrors.address1 && <p className="text-red-500 text-xs mt-1">{validationErrors.address1}</p>}
                </div>

                <div>
                  <fieldset className="border-2 border-gray-400 rounded-lg px-4 pt-2 pb-2 bg-white">
                    <legend className="text-sm px-2 text-gray-700">Address 2</legend>
                    <input
                      type="text"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="Street, Barangay (optional)"
                      className="w-full bg-transparent outline-none"
                    />
                  </fieldset>
                </div>
              </div>

              {/* ✅ NEW: Availability Selection (Matches VolunteerApproval) */}
              <div>
                <fieldset className={`border-2 rounded-lg px-4 pt-3 pb-4 bg-white ${validationErrors.availability ? 'border-red-500' : 'border-gray-400'}`}>
                  <legend className="text-sm px-2 text-gray-700">Availability <span className="text-red-500">*</span></legend>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <label key={day} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={availability.includes(day)}
                          onChange={() => toggleAvailability(day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {validationErrors.availability && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.availability}</p>
                )}
              </div>

              {/* ✅ NEW: Description Area (Matches VolunteerApproval) */}
              <div>
                <fieldset className={`border-2 rounded-lg px-4 pt-3 pb-4 bg-white ${validationErrors.description ? 'border-red-500' : 'border-gray-400'}`}>
                  <legend className="text-sm px-2 text-gray-700">Description <span className="text-red-500">*</span></legend>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (validationErrors.description) {
                        setValidationErrors({ ...validationErrors, description: null });
                      }
                    }}
                    rows="4"
                    placeholder="Tell us a little about yourself, your experience, and why you want to volunteer..."
                    className="w-full bg-transparent outline-none resize-none"
                    required
                  />
                </fieldset>
                {validationErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
                )}
              </div>

              {/* Certifications - REQUIRED */}
              <div>
                <fieldset className={`border-2 rounded-lg px-4 pt-3 pb-4 bg-white ${validationErrors.certifications ? 'border-red-500' : 'border-gray-400'}`}>
                  <legend className="text-sm px-2 text-gray-700">Certifications <span className="text-red-500">*</span></legend>
                  <Certifications
                    selected={selectedCerts}
                    setSelected={setSelectedCerts}
                    others={othersCert}
                    setOthers={setOthersCert}
                  />
                </fieldset>
                {validationErrors.certifications && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.certifications}</p>
                )}
              </div>

              {/* File Upload - REQUIRED */}
              <div>
                <div className={`border-2 border-dashed rounded-lg p-4 bg-white ${validationErrors.files ? 'border-red-500' : 'border-gray-400'}`}>
                  <p className="text-sm text-gray-700 mb-2">Upload Documents <span className="text-red-500">*</span></p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      handleFileChange(e);
                      if (validationErrors.files) {
                        setValidationErrors({ ...validationErrors, files: null });
                      }
                    }}
                    className="w-full text-sm"
                    accept=".pdf,.doc,.docx" // ✅ STRICT: Only PDF and Word docs allowed
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    Upload your resume, certificates, or any supporting documents (Required)
                  </p>
                </div>
                {validationErrors.files && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.files}</p>
                )}
              </div>

              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative border rounded-lg p-2 bg-white">
                      {preview.type.startsWith('image/') ? (
                        <img src={preview.url} alt="Preview" className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="w-full h-20 bg-gray-100 flex flex-col items-center justify-center rounded">
                          <span className="text-lg">📄</span>
                          <span className="text-xs text-gray-500 text-center truncate w-full px-1">
                            {preview.name.length > 15 ? preview.name.substring(0, 15) + '...' : preview.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Password Section with Strength Indicator */}
          <div className="w-full">
            <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-400'
              }`}>
              <legend className="text-sm px-2 text-gray-700">Password</legend>
              <div className="flex items-center">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: null });
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  required
                />
                <span onClick={() => setShowPass(!showPass)} className="cursor-pointer text-gray-500 ml-2">
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </fieldset>
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
            )}
            {/* Password Strength Indicator */}
            <PasswordStrength password={password} />
          </div>

          <div className="w-full">
            <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-400'
              }`}>
              <legend className="text-sm px-2 text-gray-700">Confirm Password</legend>
              <div className="flex items-center">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors({ ...validationErrors, confirmPassword: null });
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  required
                />
                <span onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer text-gray-500 ml-2">
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </fieldset>
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              I agree to all the{" "}
              <span onClick={handleTermsClick} className="text-red-500 cursor-pointer hover:underline">
                Terms
              </span>{" "}
              and{" "}
              <span onClick={handlePrivacyClick} className="text-red-500 cursor-pointer hover:underline">
                Privacy Policies
              </span>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?
            <Link to="/login" className="text-red-500 ml-1 cursor-pointer hover:underline">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}