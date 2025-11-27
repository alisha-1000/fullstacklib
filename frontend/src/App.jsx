import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import Userlayout from './layout/userlayout';
import AdminLayout from './layout/adminlayout';

const Login = lazy(() => import('./pages/user/login'));
const Register = lazy(() => import('./pages/user/register'));
const Home = lazy(() => import('./pages/user/home'));
const Books = lazy(() => import('./pages/user/books'));
const AllCategories = lazy(() => import('./pages/user/allcategories'));
const AdminDashboard = lazy(() => import('./pages/admin/admindashboard'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AddBookForm = lazy(() => import('./pages/admin/addbook'));
const ViewBooks = lazy(() => import('./pages/admin/viewbook'));
const AddLibrarian = lazy(() => import('./pages/admin/AddLibrarian'));
const BookDetails = lazy(() => import('./pages/user/bookdetails'));
const LibrarianRequests = lazy(() => import('./pages/librarian/LibrarianRequest'));
const ReturnRequest = lazy(() => import('./pages/librarian/ReturnRequest'));
const AboutUs = lazy(() => import('./pages/user/AboutUs'));
const ContactUs = lazy(() => import('./pages/user/ContactUs'));
const BooksBorrowed = lazy(() => import('./pages/librarian/BooksBorrowed'));

const Preloader = () => (
	<div className="preloader">
		<div className="spinner"></div>
		<p>Loading...</p>
	</div>
);

export default function App() {
	return (
		<Suspense fallback={<Preloader />}>
			<Routes>

				<Route path="/admin-login" element={<AdminLogin />} />

				<Route path="/" element={<Userlayout />}>
					<Route index element={<Home />} />
					<Route path="books" element={<Books />} />
					<Route path="bookdetails/:id" element={<BookDetails />} />
					<Route path="category" element={<AllCategories />} />
					<Route path="register" element={<Register />} />
					<Route path="login" element={<Login />} />
					<Route path="aboutus" element={<AboutUs />} />
					<Route path="contactus" element={<ContactUs />} />
				</Route>

				<Route path="/admin" element={<AdminLayout />}>
					<Route index element={<AdminDashboard />} />
					<Route path="addbook" element={<AddBookForm />} />
					<Route path="viewbook" element={<ViewBooks />} />
					<Route path="addlibrarian" element={<AddLibrarian />} />
					<Route path="issuerequest" element={<LibrarianRequests />} />
					<Route path="returnrequest" element={<ReturnRequest />} />
					<Route path="issued" element={<BooksBorrowed />} />
				</Route>

			</Routes>
		</Suspense>
	);
}
