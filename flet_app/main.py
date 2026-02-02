import flet as ft
from model import LoanPredictor
import pandas as pd
import os
from datetime import datetime

class LoanPredictionApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.predictor = LoanPredictor()
        self.batch_results = []
        
        # Configure page
        self.page.title = "Loan Prediction System"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.page.padding = 0
        self.page.window_width = 1200
        self.page.window_height = 800
        self.page.window_min_width = 800
        self.page.window_min_height = 600
        
        # Load model
        self.load_model()
        
        # Initialize UI
        self.setup_ui()
        
    def load_model(self):
        """Load the trained model"""
        model_dir = 'models'
        if os.path.exists(os.path.join(model_dir, 'loan_model.pkl')):
            try:
                self.predictor.load_model(model_dir)
                self.model_loaded = True
            except Exception as e:
                self.model_loaded = False
                print(f"Error loading model: {e}")
        else:
            self.model_loaded = False
            
    def setup_ui(self):
        """Setup the main UI"""
        # Create tabs
        self.tabs = ft.Tabs(
            selected_index=0,
            animation_duration=300,
            tabs=[
                ft.Tab(
                    text="📊 Single Prediction",
                    content=self.create_single_prediction_view()
                ),
                ft.Tab(
                    text="📁 Batch Prediction",
                    content=self.create_batch_prediction_view()
                ),
                ft.Tab(
                    text="ℹ️ Model Info",
                    content=self.create_model_info_view()
                ),
            ],
            expand=1,
        )
        
        # Main container with gradient background
        main_container = ft.Container(
            content=ft.Column([
                self.create_header(),
                ft.Container(
                    content=self.tabs,
                    expand=True,
                    padding=20,
                )
            ]),
            gradient=ft.LinearGradient(
                begin=ft.alignment.top_left,
                end=ft.alignment.bottom_right,
                colors=["#1a1a2e", "#16213e", "#0f3460"],
            ),
            expand=True,
        )
        
        self.page.add(main_container)
        
    def create_header(self):
        """Create app header"""
        return ft.Container(
            content=ft.Row([
                ft.Text("🏦", size=40),
                ft.Text(
                    "Loan Prediction System",
                    size=32,
                    weight=ft.FontWeight.BOLD,
                    color=ft.colors.WHITE,
                ),
                ft.Container(expand=True),
                ft.Container(
                    content=ft.Row([
                        ft.Text(
                            "✅" if self.model_loaded else "❌",
                            size=20,
                        ),
                        ft.Text(
                            "Model Loaded" if self.model_loaded else "Model Not Loaded",
                            color=ft.colors.GREEN_400 if self.model_loaded else ft.colors.RED_400,
                            size=14,
                        ),
                    ]),
                    bgcolor=ft.colors.with_opacity(0.2, ft.colors.WHITE),
                    padding=10,
                    border_radius=20,
                ),
            ]),
            padding=20,
            bgcolor=ft.colors.with_opacity(0.3, ft.colors.BLACK),
        )
        
    def create_single_prediction_view(self):
        """Create single prediction form"""
        # Form fields
        self.gender_dropdown = ft.Dropdown(
            label="Gender",
            options=[
                ft.dropdown.Option("Male"),
                ft.dropdown.Option("Female"),
            ],
            value="Male",
            width=300,
        )
        
        self.married_dropdown = ft.Dropdown(
            label="Marital Status",
            options=[
                ft.dropdown.Option("Yes"),
                ft.dropdown.Option("No"),
            ],
            value="Yes",
            width=300,
        )
        
        self.dependents_dropdown = ft.Dropdown(
            label="Dependents",
            options=[
                ft.dropdown.Option("0"),
                ft.dropdown.Option("1"),
                ft.dropdown.Option("2"),
                ft.dropdown.Option("3+"),
            ],
            value="0",
            width=300,
        )
        
        self.education_dropdown = ft.Dropdown(
            label="Education",
            options=[
                ft.dropdown.Option("Graduate"),
                ft.dropdown.Option("Not Graduate"),
            ],
            value="Graduate",
            width=300,
        )
        
        self.self_employed_dropdown = ft.Dropdown(
            label="Self Employed",
            options=[
                ft.dropdown.Option("Yes"),
                ft.dropdown.Option("No"),
            ],
            value="No",
            width=300,
        )
        
        self.property_area_dropdown = ft.Dropdown(
            label="Property Area",
            options=[
                ft.dropdown.Option("Urban"),
                ft.dropdown.Option("Semiurban"),
                ft.dropdown.Option("Rural"),
            ],
            value="Urban",
            width=300,
        )
        
        self.applicant_income = ft.TextField(
            label="Applicant Income",
            value="5000",
            keyboard_type=ft.KeyboardType.NUMBER,
            width=300,
        )
        
        self.coapplicant_income = ft.TextField(
            label="Coapplicant Income",
            value="0",
            keyboard_type=ft.KeyboardType.NUMBER,
            width=300,
        )
        
        self.loan_amount = ft.TextField(
            label="Loan Amount",
            value="150",
            keyboard_type=ft.KeyboardType.NUMBER,
            width=300,
        )
        
        self.loan_term = ft.TextField(
            label="Loan Amount Term (months)",
            value="360",
            keyboard_type=ft.KeyboardType.NUMBER,
            width=300,
        )
        
        self.credit_history = ft.Dropdown(
            label="Credit History",
            options=[
                ft.dropdown.Option("1", "Good (1)"),
                ft.dropdown.Option("0", "Bad (0)"),
            ],
            value="1",
            width=300,
        )
        
        # Result container
        self.single_result_container = ft.Container(
            visible=False,
            padding=20,
            border_radius=10,
        )
        
        # Predict button
        predict_button = ft.ElevatedButton(
            text="📊 Predict Loan Approval",
            on_click=self.predict_single,
            style=ft.ButtonStyle(
                color=ft.colors.WHITE,
                bgcolor=ft.colors.CYAN_700,
                padding=20,
            ),
            width=300,
            height=50,
        )
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    "Enter Loan Application Details",
                    size=24,
                    weight=ft.FontWeight.BOLD,
                    color=ft.colors.WHITE,
                ),
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            self.gender_dropdown,
                            self.married_dropdown,
                            self.dependents_dropdown,
                        ], wrap=True),
                        ft.Row([
                            self.education_dropdown,
                            self.self_employed_dropdown,
                            self.property_area_dropdown,
                        ], wrap=True),
                        ft.Row([
                            self.applicant_income,
                            self.coapplicant_income,
                            self.loan_amount,
                        ], wrap=True),
                        ft.Row([
                            self.loan_term,
                            self.credit_history,
                        ], wrap=True),
                        ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                        predict_button,
                        ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                        self.single_result_container,
                    ]),
                    bgcolor=ft.colors.with_opacity(0.1, ft.colors.WHITE),
                    padding=30,
                    border_radius=15,
                )
            ], scroll=ft.ScrollMode.AUTO),
            expand=True,
        )
        
    def predict_single(self, e):
        """Handle single prediction"""
        if not self.model_loaded:
            self.show_error("Model not loaded!")
            return
            
        try:
            # Collect form data
            data = {
                'Gender': self.gender_dropdown.value,
                'Married': self.married_dropdown.value,
                'Dependents': self.dependents_dropdown.value,
                'Education': self.education_dropdown.value,
                'Self_Employed': self.self_employed_dropdown.value,
                'ApplicantIncome': float(self.applicant_income.value),
                'CoapplicantIncome': float(self.coapplicant_income.value),
                'LoanAmount': float(self.loan_amount.value),
                'Loan_Amount_Term': float(self.loan_term.value),
                'Credit_History': float(self.credit_history.value),
                'Property_Area': self.property_area_dropdown.value,
            }
            
            # Make prediction
            result = self.predictor.predict(data)
            
            # Display result
            self.show_single_result(result)
            
        except Exception as ex:
            self.show_error(f"Prediction error: {str(ex)}")
            
    def show_single_result(self, result):
        """Display single prediction result"""
        prediction = result['prediction']
        probability = result['probability']
        confidence = result['confidence']
        
        is_approved = prediction == "Approved"
        
        self.single_result_container.content = ft.Column([
            ft.Container(
                content=ft.Column([
                    ft.Row([
                        ft.Text(
                            "✅" if is_approved else "❌",
                            size=60,
                        ),
                        ft.Column([
                            ft.Text(
                                prediction,
                                size=32,
                                weight=ft.FontWeight.BOLD,
                                color=ft.colors.GREEN_400 if is_approved else ft.colors.RED_400,
                            ),
                            ft.Text(
                                f"Confidence: {confidence*100:.1f}%",
                                size=18,
                                color=ft.colors.WHITE70,
                            ),
                        ]),
                    ]),
                    ft.Divider(height=20, color=ft.colors.WHITE24),
                    ft.Row([
                        ft.Column([
                            ft.Text("Approval Probability", size=14, color=ft.colors.WHITE70),
                            ft.Text(f"{probability*100:.1f}%", size=24, weight=ft.FontWeight.BOLD, color=ft.colors.CYAN_400),
                        ]),
                        ft.Container(width=50),
                        ft.Column([
                            ft.Text("Rejection Probability", size=14, color=ft.colors.WHITE70),
                            ft.Text(f"{(1-probability)*100:.1f}%", size=24, weight=ft.FontWeight.BOLD, color=ft.colors.ORANGE_400),
                        ]),
                    ]),
                ]),
                bgcolor=ft.colors.with_opacity(0.2, ft.colors.WHITE),
                padding=30,
                border_radius=15,
                animate=ft.animation.Animation(300, ft.AnimationCurve.EASE_OUT),
            )
        ])
        
        self.single_result_container.visible = True
        self.page.update()
        
    def create_batch_prediction_view(self):
        """Create batch prediction view"""
        self.file_picker = ft.FilePicker(on_result=self.on_file_picked)
        self.page.overlay.append(self.file_picker)
        
        self.selected_file_text = ft.Text("No file selected", color=ft.colors.WHITE70)
        
        self.batch_results_table = ft.DataTable(
            columns=[
                ft.DataColumn(ft.Text("Loan ID", color=ft.colors.CYAN_400)),
                ft.DataColumn(ft.Text("Prediction", color=ft.colors.CYAN_400)),
                ft.DataColumn(ft.Text("Probability", color=ft.colors.CYAN_400)),
                ft.DataColumn(ft.Text("Confidence", color=ft.colors.CYAN_400)),
            ],
            rows=[],
            border=ft.border.all(1, ft.colors.WHITE24),
            border_radius=10,
            horizontal_lines=ft.border.BorderSide(1, ft.colors.WHITE24),
        )
        
        self.batch_results_container = ft.Container(
            content=ft.Column([
                ft.Text("Prediction Results", size=20, weight=ft.FontWeight.BOLD, color=ft.colors.WHITE),
                ft.Divider(height=10, color=ft.colors.TRANSPARENT),
                self.batch_results_table,
                ft.Divider(height=10, color=ft.colors.TRANSPARENT),
                ft.ElevatedButton(
                    text="💾 Export Results",
                    on_click=self.export_batch_results,
                    style=ft.ButtonStyle(
                        color=ft.colors.WHITE,
                        bgcolor=ft.colors.GREEN_700,
                    ),
                ),
            ], scroll=ft.ScrollMode.AUTO),
            visible=False,
            bgcolor=ft.colors.with_opacity(0.1, ft.colors.WHITE),
            padding=20,
            border_radius=15,
        )
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    "Batch Prediction from CSV",
                    size=24,
                    weight=ft.FontWeight.BOLD,
                    color=ft.colors.WHITE,
                ),
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                ft.Container(
                    content=ft.Column([
                        ft.Text("☁️📤", size=60),
                        ft.Text(
                            "Upload CSV File",
                            size=20,
                            weight=ft.FontWeight.BOLD,
                            color=ft.colors.WHITE,
                        ),
                        ft.Text(
                            "Select a CSV file with loan application data",
                            size=14,
                            color=ft.colors.WHITE70,
                        ),
                        ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                        self.selected_file_text,
                        ft.Divider(height=10, color=ft.colors.TRANSPARENT),
                        ft.ElevatedButton(
                            text="📁 Choose File",
                            on_click=lambda _: self.file_picker.pick_files(
                                allowed_extensions=["csv"],
                                dialog_title="Select CSV file",
                            ),
                            style=ft.ButtonStyle(
                                color=ft.colors.WHITE,
                                bgcolor=ft.colors.CYAN_700,
                                padding=20,
                            ),
                            width=200,
                        ),
                    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
                    bgcolor=ft.colors.with_opacity(0.1, ft.colors.WHITE),
                    padding=40,
                    border_radius=15,
                    alignment=ft.alignment.center,
                ),
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                self.batch_results_container,
            ], scroll=ft.ScrollMode.AUTO),
            expand=True,
        )
        
    def on_file_picked(self, e: ft.FilePickerResultEvent):
        """Handle file selection"""
        if e.files:
            file_path = e.files[0].path
            self.selected_file_text.value = f"Selected: {os.path.basename(file_path)}"
            self.page.update()
            self.process_batch_file(file_path)
            
    def process_batch_file(self, file_path):
        """Process batch CSV file"""
        if not self.model_loaded:
            self.show_error("Model not loaded!")
            return
            
        try:
            # Read CSV
            df = pd.read_csv(file_path)
            
            # Store Loan_IDs if present
            loan_ids = df['Loan_ID'].tolist() if 'Loan_ID' in df.columns else list(range(1, len(df) + 1))
            
            # Make predictions
            self.batch_results = []
            self.batch_results_table.rows.clear()
            
            for idx, row in df.iterrows():
                try:
                    result = self.predictor.predict(row.to_dict())
                    self.batch_results.append({
                        'loan_id': loan_ids[idx],
                        'prediction': result['prediction'],
                        'probability': result['probability'],
                        'confidence': result['confidence']
                    })
                    
                    # Add to table
                    is_approved = result['prediction'] == "Approved"
                    self.batch_results_table.rows.append(
                        ft.DataRow(
                            cells=[
                                ft.DataCell(ft.Text(str(loan_ids[idx]), color=ft.colors.WHITE)),
                                ft.DataCell(ft.Text(
                                    result['prediction'],
                                    color=ft.colors.GREEN_400 if is_approved else ft.colors.RED_400,
                                    weight=ft.FontWeight.BOLD,
                                )),
                                ft.DataCell(ft.Text(f"{result['probability']*100:.1f}%", color=ft.colors.WHITE)),
                                ft.DataCell(ft.Text(f"{result['confidence']*100:.1f}%", color=ft.colors.WHITE)),
                            ]
                        )
                    )
                except Exception as ex:
                    print(f"Error processing row {idx}: {ex}")
                    
            self.batch_results_container.visible = True
            self.page.update()
            
        except Exception as ex:
            self.show_error(f"Error processing file: {str(ex)}")
            
    def export_batch_results(self, e):
        """Export batch results to CSV"""
        if not self.batch_results:
            self.show_error("No results to export!")
            return
            
        try:
            # Create DataFrame
            df = pd.DataFrame(self.batch_results)
            
            # Save to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"batch_predictions_{timestamp}.csv"
            df.to_csv(output_file, index=False)
            
            self.show_success(f"Results exported to {output_file}")
            
        except Exception as ex:
            self.show_error(f"Export error: {str(ex)}")
            
    def create_model_info_view(self):
        """Create model info view"""
        if not self.model_loaded:
            return ft.Container(
                content=ft.Column([
                    ft.Text("⚠️", size=80),
                    ft.Text(
                        "Model Not Loaded",
                        size=24,
                        weight=ft.FontWeight.BOLD,
                        color=ft.colors.RED_400,
                    ),
                    ft.Text(
                        "Please ensure the model files are in the 'models' directory",
                        size=14,
                        color=ft.colors.WHITE70,
                    ),
                ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
                expand=True,
                alignment=ft.alignment.center,
            )
            
        metrics = self.predictor.model_metrics
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    "Model Performance Metrics",
                    size=24,
                    weight=ft.FontWeight.BOLD,
                    color=ft.colors.WHITE,
                ),
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                ft.Row([
                    self.create_metric_card("Accuracy", metrics.get('accuracy', 0)),
                    self.create_metric_card("Precision", metrics.get('precision', 0)),
                ], wrap=True),
                ft.Row([
                    self.create_metric_card("Recall", metrics.get('recall', 0)),
                    self.create_metric_card("F1 Score", metrics.get('f1_score', 0)),
                ], wrap=True),
                ft.Divider(height=20, color=ft.colors.TRANSPARENT),
                ft.Container(
                    content=ft.Column([
                        ft.Text(
                            "Model Information",
                            size=20,
                            weight=ft.FontWeight.BOLD,
                            color=ft.colors.WHITE,
                        ),
                        ft.Divider(height=10, color=ft.colors.TRANSPARENT),
                        ft.Text(f"Algorithm: Random Forest Classifier", color=ft.colors.WHITE70),
                        ft.Text(f"Total Features: {len(self.predictor.feature_columns)}", color=ft.colors.WHITE70),
                        ft.Text(f"Features: {', '.join(self.predictor.feature_columns[:5])}...", color=ft.colors.WHITE70),
                    ]),
                    bgcolor=ft.colors.with_opacity(0.1, ft.colors.WHITE),
                    padding=20,
                    border_radius=15,
                ),
            ], scroll=ft.ScrollMode.AUTO),
            expand=True,
        )
        
    def create_metric_card(self, title, value):
        """Create a metric card"""
        return ft.Container(
            content=ft.Column([
                ft.Text(title, size=16, color=ft.colors.WHITE70),
                ft.Text(
                    f"{value*100:.2f}%" if value < 1 else f"{value:.2f}%",
                    size=36,
                    weight=ft.FontWeight.BOLD,
                    color=ft.colors.CYAN_400,
                ),
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            bgcolor=ft.colors.with_opacity(0.2, ft.colors.WHITE),
            padding=30,
            border_radius=15,
            width=250,
            height=150,
            margin=10,
        )
        
    def show_error(self, message):
        """Show error snackbar"""
        self.page.snack_bar = ft.SnackBar(
            content=ft.Text(message, color=ft.colors.WHITE),
            bgcolor=ft.colors.RED_700,
        )
        self.page.snack_bar.open = True
        self.page.update()
        
    def show_success(self, message):
        """Show success snackbar"""
        self.page.snack_bar = ft.SnackBar(
            content=ft.Text(message, color=ft.colors.WHITE),
            bgcolor=ft.colors.GREEN_700,
        )
        self.page.snack_bar.open = True
        self.page.update()

def main(page: ft.Page):
    LoanPredictionApp(page)

if __name__ == "__main__":
    ft.app(target=main)
